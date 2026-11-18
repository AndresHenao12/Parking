<?php

namespace App\Http\Controllers;

use App\Models\Boleta;
use App\Models\Compra;
use App\Models\Funcion;
use App\Models\Pago;
use App\Models\Silla;
use App\Models\StripeEvent;
use App\Services\StripeService;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;
use Stripe\Exception\SignatureVerificationException;

class PagoController extends Controller
{
    public function iniciarPago(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'funcion_id' => ['required', 'integer', 'exists:funciones,id'],
            'sillas' => ['required', 'array', 'min:1'],
            'sillas.*' => ['integer', 'min:1'],
            'moneda' => ['nullable', 'string', 'max:10'],
        ]);

        $funcion = Funcion::with(['pelicula', 'sala'])->findOrFail($validated['funcion_id']);

        if (! $funcion->estado) {
            throw ValidationException::withMessages([
                'funcion_id' => ['La función seleccionada no está activa.'],
            ]);
        }

        $sillasSeleccionadas = collect($validated['sillas'])
            ->map(fn ($id) => (int) $id)
            ->values();

        if ($sillasSeleccionadas->unique()->count() !== $sillasSeleccionadas->count()) {
            throw ValidationException::withMessages([
                'sillas' => ['Las sillas seleccionadas no pueden repetirse.'],
            ]);
        }

        $sillasDisponibles = Silla::whereIn('id', $sillasSeleccionadas)
            ->where('sala_id', $funcion->sala_id)
            ->pluck('id')
            ->all();

        if (count($sillasDisponibles) !== $sillasSeleccionadas->count()) {
            throw ValidationException::withMessages([
                'sillas' => ['Algunas sillas seleccionadas no pertenecen a la función.'],
            ]);
        }

        $ocupadas = Boleta::where('funcion_id', $funcion->id)
            ->whereIn('silla_id', $sillasSeleccionadas)
            ->whereIn('estado', ['pendiente', 'pagada'])
            ->exists();

        if ($ocupadas) {
            throw ValidationException::withMessages([
                'sillas' => ['Una o más sillas ya están reservadas o vendidas.'],
            ]);
        }

        $subtotal = (float) $funcion->precio * $sillasSeleccionadas->count();
        $total = round($subtotal, 2);
        $moneda = strtoupper($validated['moneda'] ?? 'COP');

        $compra = DB::transaction(function () use ($funcion, $sillasSeleccionadas, $subtotal, $total, $moneda) {
            $compra = Compra::create([
                'codigo_compra' => 'CMP-'.strtoupper(Str::random(8)),
                'user_id' => Auth::id(),
                'subtotal' => $subtotal,
                'total' => $total,
                'moneda' => $moneda,
                'estado' => 'pendiente',
            ]);

            foreach ($sillasSeleccionadas as $sillaId) {
                Boleta::create([
                    'compra_id' => $compra->id,
                    'funcion_id' => $funcion->id,
                    'silla_id' => $sillaId,
                    'codigo_boleta' => 'BOL-'.strtoupper(Str::random(10)),
                    'precio' => $funcion->precio,
                    'estado' => 'pendiente',
                ]);
            }

            return $compra;
        });

        $pago = Pago::create([
            'compra_id' => $compra->id,
            'proveedor' => 'stripe',
            'monto' => $total,
            'moneda' => $moneda,
            'estado' => 'pendiente',
        ]);

        $stripe = app(StripeService::class);
        $sesion = $stripe->crearSesionPago(
            $compra->id,
            (int) round($total * 100),
            $funcion->pelicula->titulo.' - '.$funcion->fecha,
            $moneda,
        );

        $pago->update([
            'session_id' => $sesion['id'],
            'referencia_externa' => $sesion['id'],
            'estado' => 'pendiente',
            'payment_intent_id' => $sesion['payment_intent'] ?? null,
        ]);

        return response()->json([
            'url' => $sesion['url'],
            'compra_id' => $compra->id,
            'codigo_compra' => $compra->codigo_compra,
        ]);
    }

    public function exitoso(Request $request): InertiaResponse
    {
        $sessionId = $request->query('session_id');
        $compra = null;

        if ($sessionId) {
            $stripe = app(StripeService::class);
            $sesion = $stripe->consultarSesion($sessionId);

            if ($sesion) {
                $compraId = (int) ($sesion->metadata->compra_id ?? 0);
                $compra = Compra::with(['boletas.funcion.pelicula', 'boletas.silla'])->find($compraId);
                $this->confirmarCompraPorSession($sessionId);
            }
        }

        return Inertia::render('Pagos/Exitoso', [
            'compra' => $compra,
            'session_id' => $sessionId,
        ]);
    }

    public function cancelado(): InertiaResponse
    {
        return Inertia::render('Pagos/Cancelado', [
            'mensaje' => 'La compra fue cancelada.',
        ]);
    }

    public function webhook(Request $request): JsonResponse
    {
        try {
            $stripe = app(StripeService::class);
            $event = $stripe->verificarFirmaWebhook($request->getContent(), $request->header('Stripe-Signature'));
        } catch (SignatureVerificationException $exception) {
            return response()->json(['error' => 'Firma inválida'], 400);
        } catch (\RuntimeException $exception) {
            return response()->json(['error' => $exception->getMessage()], 500);
        }

        if (StripeEvent::where('event_id', $event->id)->exists()) {
            return response()->json(['received' => true]);
        }

        StripeEvent::create([
            'event_id' => $event->id,
            'event_type' => $event->type,
            'processed_at' => now(),
        ]);

        $object = $event->data->object ?? null;

        if (! $object) {
            return response()->json(['received' => true]);
        }

        $sessionId = $object->id ?? null;

        switch ($event->type) {
            case 'checkout.session.completed':
            case 'checkout.session.async_payment_succeeded':
                if ($sessionId) {
                    $this->confirmarCompraPorSession($sessionId);
                }
                break;

            case 'checkout.session.async_payment_failed':
            case 'checkout.session.expired':
                if ($sessionId) {
                    $this->cancelarCompraPorSession($sessionId);
                }
                break;

            case 'payment_intent.payment_failed':
                $paymentIntentId = $object->id ?? null;
                if ($paymentIntentId) {
                    $pago = Pago::where('payment_intent_id', $paymentIntentId)->first();
                    if ($pago) {
                        $pago->update(['estado' => 'rechazado']);
                    }
                }
                break;
        }

        return response()->json(['received' => true]);
    }

    public function descargarBoletasPdf(Compra $compra): \Symfony\Component\HttpFoundation\Response
    {
        if (Auth::id() !== $compra->user_id) {
            abort(403, 'No tienes permiso para ver estas boletas.');
        }

        if ($compra->estado !== 'pagada') {
            abort(403, 'Las boletas solo estarán disponibles una vez confirmado el pago.');
        }

        $compra->load(['boletas.funcion.pelicula', 'boletas.silla']);
        $pdf = Pdf::loadView('pdf.boletas', ['compra' => $compra]);

        return $pdf->download('boletas-'.$compra->codigo_compra.'.pdf');
    }

    protected function confirmarCompraPorSession(string $sessionId): void
    {
        $pago = Pago::where('session_id', $sessionId)->first();

        if (! $pago) {
            return;
        }

        if ($pago->estado === 'aprobado') {
            return;
        }

        $stripe = app(StripeService::class);
        $sesion = $stripe->consultarSesion($sessionId);

        if (! $sesion) {
            return;
        }

        $compraId = (int) ($sesion->metadata->compra_id ?? 0);
        $compra = Compra::find($compraId);

        if (! $compra || $compra->estado === 'pagada') {
            return;
        }

        if ($sesion->payment_status !== 'paid') {
            $pago->update(['estado' => 'rechazado']);

            return;
        }

        DB::transaction(function () use ($pago, $compra, $sesion) {
            $pago->update([
                'proveedor' => 'stripe',
                'monto' => $sesion->amount_total / 100,
                'moneda' => strtoupper($sesion->currency ?? 'COP'),
                'estado' => 'aprobado',
                'payment_intent_id' => $sesion->payment_intent ?? $pago->payment_intent_id,
                'pagado_en' => now(),
                'respuesta_proveedor' => [
                    'session_id' => $sesion->id,
                    'payment_status' => $sesion->payment_status,
                    'amount_total' => $sesion->amount_total,
                    'currency' => $sesion->currency,
                ],
            ]);

            $compra->update([
                'estado' => 'pagada',
                'fecha_compra' => now(),
            ]);

            $compra->boletas()->update(['estado' => 'pagada']);
        });
    }

    protected function cancelarCompraPorSession(string $sessionId): void
    {
        $pago = Pago::where('session_id', $sessionId)->first();

        if (! $pago) {
            return;
        }

        if ($pago->compra && $pago->compra->estado === 'pagada') {
            return;
        }

        $pago->update(['estado' => 'cancelado']);
        $pago->compra?->update(['estado' => 'cancelada']);
    }
}
