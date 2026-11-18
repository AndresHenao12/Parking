<?php

namespace App\Http\Controllers;

use App\Models\Tarifa;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class TarifaController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Park/Tarifas/Index', [
            'records' => Tarifa::query()
                ->orderBy('nombre')
                ->get()
                ->map(fn (Tarifa $tarifa): array => [
                    'id' => (string) $tarifa->id,
                    'nombre' => $tarifa->nombre,
                    'tipo_vehiculo' => $tarifa->tipo_vehiculo,
                    'precio_hora' => number_format((float) $tarifa->precio_hora, 2, ',', '.'),
                    'precio_diario' => number_format((float) $tarifa->precio_diario, 2, ',', '.'),
                    'activo' => $tarifa->activo ? 'Activo' : 'Inactiva',
                ]),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        Tarifa::create($request->validate($this->rules()));

        return redirect()->route('tarifas.index');
    }

    public function update(Request $request, Tarifa $tarifa): RedirectResponse
    {
        $tarifa->update($request->validate($this->rules()));

        return redirect()->route('tarifas.index');
    }

    public function destroy(Tarifa $tarifa): RedirectResponse
    {
        $tarifa->delete();

        return redirect()->route('tarifas.index');
    }

    /**
     * @return array<string, array<int, mixed>>
     */
    private function rules(): array
    {
        return [
            'nombre' => ['required', 'string', 'max:100'],
            'tipo_vehiculo' => ['required', 'string', 'max:30'],
            'precio_hora' => ['required', 'numeric', 'min:0'],
            'precio_diario' => ['required', 'numeric', 'min:0'],
            'activo' => ['required', 'boolean'],
        ];
    }
}
