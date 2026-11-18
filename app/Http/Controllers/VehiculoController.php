<?php

namespace App\Http\Controllers;

use App\Models\Vehiculo;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class VehiculoController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Park/Vehiculos/Index', [
            'records' => Vehiculo::query()
                ->orderBy('placa')
                ->get()
                ->map(fn (Vehiculo $vehiculo): array => [
                    'id' => (string) $vehiculo->id,
                    'placa' => $vehiculo->placa,
                    'marca' => $vehiculo->marca,
                    'modelo' => $vehiculo->modelo,
                    'color' => $vehiculo->color,
                    'tipo_vehiculo' => $vehiculo->tipo_vehiculo,
                    'propietario' => $vehiculo->propietario,
                    'telefono_propietario' => $vehiculo->telefono_propietario,
                    'estado' => $vehiculo->estado,
                ]),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        Vehiculo::create($request->validate($this->rules()));

        return redirect()->route('vehiculos.index');
    }

    public function update(Request $request, Vehiculo $vehiculo): RedirectResponse
    {
        $vehiculo->update($request->validate($this->rules($vehiculo)));

        return redirect()->route('vehiculos.index');
    }

    public function destroy(Vehiculo $vehiculo): RedirectResponse
    {
        $vehiculo->delete();

        return redirect()->route('vehiculos.index');
    }

    /**
     * @return array<string, array<int, mixed>>
     */
    private function rules(?Vehiculo $vehiculo = null): array
    {
        return [
            'placa' => ['required', 'string', 'max:20', Rule::unique('vehiculos', 'placa')->ignore($vehiculo?->id)],
            'marca' => ['required', 'string', 'max:80'],
            'modelo' => ['required', 'string', 'max:80'],
            'color' => ['nullable', 'string', 'max:50'],
            'tipo_vehiculo' => ['required', 'string', 'max:30'],
            'propietario' => ['required', 'string', 'max:150'],
            'telefono_propietario' => ['nullable', 'string', 'max:30'],
            'estado' => ['required', 'string', 'in:activo,inactivo'],
            'observacion' => ['nullable', 'string'],
        ];
    }
}
