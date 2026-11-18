<?php

namespace App\Http\Controllers;

use App\Models\Celda;
use App\Models\RegistroEstacionamiento;
use App\Models\Tarifa;
use App\Models\Vehiculo;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class RegistroEstacionamientoController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Park/Registros/Index', [
            'records' => RegistroEstacionamiento::query()
                ->with(['vehiculo', 'celda', 'tarifa'])
                ->orderByDesc('hora_entrada')
                ->get()
                ->map(fn (RegistroEstacionamiento $registro): array => [
                    'id' => (string) $registro->id,
                    'vehiculo' => $registro->vehiculo?->placa ?? 'Sin vehículo',
                    'celda' => $registro->celda?->codigo ?? 'Sin celda',
                    'tarifa' => $registro->tarifa?->nombre ?? 'Sin tarifa',
                    'hora_entrada' => $registro->hora_entrada,
                    'hora_salida' => $registro->hora_salida,
                    'tiempo_minutos' => $registro->tiempo_minutos,
                    'valor_total' => number_format((float) $registro->valor_total, 2, ',', '.'),
                    'estado' => $registro->estado,
                ]),
            'vehiculos' => Vehiculo::query()->orderBy('placa')->get(['id', 'placa', 'tipo_vehiculo']),
            'celdas' => Celda::query()->where('estado', 'disponible')->orderBy('codigo')->get(['id', 'codigo']),
            'tarifas' => Tarifa::query()->where('activo', true)->orderBy('nombre')->get(['id', 'nombre', 'tipo_vehiculo']),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate($this->rules());

        $vehiculo = Vehiculo::findOrFail($validated['vehiculo_id']);
        $celda = Celda::findOrFail($validated['celda_id']);

        if (RegistroEstacionamiento::query()->where('vehiculo_id', $vehiculo->id)->where('estado', 'activo')->exists()) {
            return back()->withErrors(['vehiculo_id' => 'El vehículo ya tiene un registro activo.']);
        }

        if (in_array($celda->estado, ['ocupada', 'mantenimiento'], true)) {
            return back()->withErrors(['celda_id' => 'La celda seleccionada no está disponible.']);
        }

        $registro = RegistroEstacionamiento::create([
            ...$validated,
            'estado' => 'activo',
            'tiempo_minutos' => 0,
            'valor_total' => 0,
        ]);

        $celda->update(['estado' => 'ocupada']);
        $vehiculo->update(['estado' => 'activo']);

        return redirect()->route('registros.index');
    }

    public function update(Request $request, RegistroEstacionamiento $registro): RedirectResponse
    {
        $validated = $request->validate([
            'hora_salida' => ['nullable', 'date'],
            'estado' => ['required', 'string', 'in:activo,finalizado'],
        ]);

        $horaSalida = $validated['hora_salida'] ? Carbon::parse($validated['hora_salida']) : Carbon::now();
        $horaEntrada = Carbon::parse($registro->hora_entrada);
        $tiempoMinutos = max(1, $horaEntrada->diffInMinutes($horaSalida));

        $tarifa = $registro->tarifa ?? Tarifa::query()
            ->where('tipo_vehiculo', $registro->vehiculo?->tipo_vehiculo ?? '')
            ->where('activo', true)
            ->first();
        $valorTotal = $tarifa ? round((float) $tarifa->precio_hora * ($tiempoMinutos / 60), 2) : 0;

        $registro->update([
            'hora_salida' => $horaSalida,
            'tiempo_minutos' => $tiempoMinutos,
            'valor_total' => $valorTotal,
            'estado' => $validated['estado'],
        ]);

        $registro->celda?->update(['estado' => 'disponible']);
        $registro->vehiculo?->update(['estado' => 'inactivo']);

        return redirect()->route('registros.index');
    }

    public function destroy(RegistroEstacionamiento $registro): RedirectResponse
    {
        $registro->delete();

        return redirect()->route('registros.index');
    }

    /**
     * @return array<string, array<int, mixed>>
     */
    private function rules(): array
    {
        return [
            'vehiculo_id' => ['required', 'integer', Rule::exists('vehiculos', 'id')],
            'celda_id' => ['required', 'integer', Rule::exists('celdas', 'id')],
            'tarifa_id' => ['nullable', 'integer', Rule::exists('tarifas', 'id')],
            'hora_entrada' => ['required', 'date'],
            'estado' => ['nullable', 'string', 'in:activo,finalizado'],
        ];
    }
}
