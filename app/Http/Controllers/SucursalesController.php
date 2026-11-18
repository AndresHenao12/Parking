<?php

namespace App\Http\Controllers;

use App\Models\Ciudades;
use App\Models\Sucursales;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class SucursalesController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(): Response
    {
        return Inertia::render('Sucursales/Index', [
            'records' => Sucursales::query()
                ->with('ciudad.departamento:id,nombre')
                ->orderBy('nombre')
                ->get()
                ->map(fn (Sucursales $sucursal): array => [
                    'id' => (string) $sucursal->id,
                    'ciudad_id' => (string) $sucursal->ciudad_id,
                    'ciudad' => $sucursal->ciudad->nombre,
                    'departamento' => $sucursal->ciudad->departamento->nombre,
                    'nombre' => $sucursal->nombre,
                    'direccion' => $sucursal->direccion,
                    'descripcion' => $sucursal->descripcion,
                ]),
            'ciudades' => Ciudades::query()
                ->with('departamento:id,nombre')
                ->orderBy('nombre')
                ->get()
                ->map(fn (Ciudades $ciudad): array => [
                    'id' => (string) $ciudad->id,
                    'nombre' => $ciudad->nombre.' — '.$ciudad->departamento->nombre,
                ]),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): RedirectResponse
    {
        Sucursales::create($request->validate($this->rules()));

        return redirect()->route('sucursales.index');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Sucursales $sucursal): RedirectResponse
    {
        $sucursal->update($request->validate($this->rules()));

        return redirect()->route('sucursales.index');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Sucursales $sucursal): RedirectResponse
    {
        $sucursal->delete();

        return redirect()->route('sucursales.index');
    }

    /**
     * @return array<string, array<int, mixed>>
     */
    private function rules(): array
    {
        return [
            'ciudad_id' => ['required', 'integer', Rule::exists('ciudades', 'id')],
            'nombre' => ['required', 'string', 'max:150'],
            'direccion' => ['required', 'string', 'max:255'],
            'descripcion' => ['nullable', 'string', 'max:500'],
        ];
    }
}
