<?php

namespace App\Http\Controllers;

use App\Models\MovimientoInventario;
use App\Models\Producto;
use App\Models\Trabajadores;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class InventarioController extends Controller
{
    public function index(Request $request): Response
    {
        $productoId = $request->input('producto_id');
        $tipo = $request->input('tipo');
        $fechaInicio = $request->input('fecha_inicio');
        $fechaFin = $request->input('fecha_fin');
        $tab = $request->input('tab', 'movimientos'); // 'existencias' o 'movimientos'

        // Consulta de existencias
        $existenciasQuery = Producto::query()
            ->with('categoria')
            ->orderBy('nombre');

        if ($search = $request->input('search')) {
            $existenciasQuery->where('nombre', 'like', "%{$search}%");
        }

        $existencias = $existenciasQuery->get();

        // Consulta de movimientos
        $movimientosQuery = MovimientoInventario::query()
            ->with(['producto.categoria', 'user', 'trabajador', 'venta'])
            ->orderByDesc('fecha')
            ->orderByDesc('id');

        if ($productoId) {
            $movimientosQuery->where('producto_id', $productoId);
        }

        if ($tipo && in_array($tipo, ['entrada', 'salida'])) {
            $movimientosQuery->where('tipo', $tipo);
        }

        if ($fechaInicio) {
            $movimientosQuery->whereDate('fecha', '>=', $fechaInicio);
        }

        if ($fechaFin) {
            $movimientosQuery->whereDate('fecha', '<=', $fechaFin);
        }

        $movimientos = $movimientosQuery->paginate(25)->withQueryString();

        $trabajadores = Trabajadores::query()
            ->orderBy('nombres')
            ->get(['id', 'nombres', 'apellidos']);

        return Inertia::render('Cafeteria/Inventario/Index', [
            'existencias' => $existencias,
            'movimientos' => $movimientos,
            'trabajadores' => $trabajadores,
            'filtros' => [
                'producto_id' => $productoId ?? '',
                'tipo' => $tipo ?? '',
                'fecha_inicio' => $fechaInicio ?? '',
                'fecha_fin' => $fechaFin ?? '',
                'search' => $search ?? '',
                'tab' => $tab,
            ],
            'resumen' => [
                'total_productos' => $existencias->count(),
                'stock_bajo_count' => $existencias->where('es_stock_bajo', true)->count(),
                'total_unidades' => $existencias->sum('cantidad_disponible'),
            ],
        ]);
    }

    public function storeMovimiento(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'producto_id' => ['required', 'integer', 'exists:productos,id'],
            'tipo' => ['required', 'string', 'in:entrada,salida'],
            'cantidad' => ['required', 'integer', 'min:1'],
            'motivo' => ['required', 'string', 'max:100'],
            'observacion' => ['nullable', 'string', 'max:500'],
            'trabajador_id' => ['nullable', 'integer', 'exists:trabajadores,id'],
        ]);

        DB::transaction(function () use ($validated) {
            $producto = Producto::where('id', $validated['producto_id'])
                ->lockForUpdate()
                ->firstOrFail();

            $cantidad = (int) $validated['cantidad'];
            $stockAnterior = $producto->cantidad_disponible;

            if ($validated['tipo'] === 'salida') {
                if ($cantidad > $stockAnterior) {
                    throw ValidationException::withMessages([
                        'cantidad' => "No es posible registrar una salida de {$cantidad} unidades. El inventario actual es de {$stockAnterior} unidades.",
                    ]);
                }
                $stockNuevo = $stockAnterior - $cantidad;
            } else {
                $stockNuevo = $stockAnterior + $cantidad;
            }

            // Actualizar stock del producto
            $producto->cantidad_disponible = $stockNuevo;
            $producto->save();

            // Registrar movimiento
            MovimientoInventario::create([
                'producto_id' => $producto->id,
                'tipo' => $validated['tipo'],
                'cantidad' => $cantidad,
                'stock_anterior' => $stockAnterior,
                'stock_nuevo' => $stockNuevo,
                'motivo' => $validated['motivo'],
                'observacion' => $validated['observacion'] ?? null,
                'user_id' => auth()->id() ?? 1,
                'trabajador_id' => $validated['trabajador_id'] ?? null,
                'fecha' => Carbon::now(),
            ]);
        });

        return back()->with('success', 'Movimiento de inventario registrado correctamente.');
    }
}
