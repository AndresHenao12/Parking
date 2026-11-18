<?php

namespace App\Http\Controllers;

use App\Models\Mensualidad;
use App\Models\Tarifa;
use App\Models\Vehiculo;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class MensualidadController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Park/Mensualidades/Index', [
            'records' => Mensualidad::query()
                ->with(['vehiculo', 'tarifa'])
                ->orderByDesc('fecha_vencimiento')
                ->get()
                ->map(fn (Mensualidad $mensualidad): array => [
                    'id' => (string) $mensualidad->id,
                    'vehiculo' => $mensualidad->vehiculo?->placa ?? 'Sin vehículo',
                    'tarifa' => $mensualidad->tarifa?->nombre ?? 'Sin tarifa',
                    'valor' => number_format((float) $mensualidad->valor, 2, ',', '.'),
                    'fecha_inicio' => $mensualidad->fecha_inicio,
                    'fecha_vencimiento' => $mensualidad->fecha_vencimiento,
                    'estado' => $mensualidad->estado,
                ]),
            'vehiculos' => Vehiculo::query()->orderBy('placa')->get(['id', 'placa']),
            'tarifas' => Tarifa::query()->where('activo', true)->orderBy('nombre')->get(['id', 'nombre']),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        Mensualidad::create($request->validate($this->rules()));

        return redirect()->route('mensualidades.index');
    }

    public function update(Request $request, Mensualidad $mensualidad): RedirectResponse
    {
        $mensualidad->update($request->validate($this->rules()));

        return redirect()->route('mensualidades.index');
    }

    public function destroy(Mensualidad $mensualidad): RedirectResponse
    {
        $mensualidad->delete();

        return redirect()->route('mensualidades.index');
    }

    /**
     * @return array<string, array<int, mixed>>
     */
    private function rules(): array
    {
        return [
            'vehiculo_id' => ['required', 'integer', Rule::exists('vehiculos', 'id')],
            'tarifa_id' => ['nullable', 'integer', Rule::exists('tarifas', 'id')],
            'valor' => ['required', 'numeric', 'min:0'],
            'fecha_inicio' => ['required', 'date'],
            'fecha_vencimiento' => ['required', 'date', 'after_or_equal:fecha_inicio'],
            'estado' => ['required', 'string', 'in:vigente,vencida,desactivada'],
        ];
    }
}
