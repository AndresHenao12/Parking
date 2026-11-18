<?php

namespace App\Http\Controllers;

use App\Models\Sucursales;
use App\Models\Trabajadores;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class TrabajadoresController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(): Response
    {
        return Inertia::render('Trabajadores/Index', [
            'records' => Trabajadores::query()
                ->with('sucursal.ciudad.departamento:id,nombre')
                ->orderBy('apellidos')
                ->orderBy('nombres')
                ->get()
                ->map(fn (Trabajadores $trabajador): array => [
                    'id' => (string) $trabajador->id,
                    'sucursal_id' => (string) $trabajador->sucursal_id,
                    'sucursal' => $trabajador->sucursal->nombre,
                    'ciudad' => $trabajador->sucursal->ciudad->nombre,
                    'departamento' => $trabajador->sucursal->ciudad->departamento->nombre,
                    'nombres' => $trabajador->nombres,
                    'apellidos' => $trabajador->apellidos,
                    'telefono' => $trabajador->telefono,
                    'direccion' => $trabajador->direccion,
                ]),
            'sucursales' => Sucursales::query()
                ->with('ciudad:id,nombre')
                ->orderBy('nombre')
                ->get()
                ->map(fn (Sucursales $sucursal): array => [
                    'id' => (string) $sucursal->id,
                    'nombre' => $sucursal->nombre.' — '.$sucursal->ciudad->nombre,
                ]),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): RedirectResponse
    {
        Trabajadores::create($request->validate($this->rules()));

        return redirect()->route('trabajadores.index');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Trabajadores $trabajador): RedirectResponse
    {
        $trabajador->update($request->validate($this->rules()));

        return redirect()->route('trabajadores.index');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Trabajadores $trabajador): RedirectResponse
    {
        $trabajador->delete();

        return redirect()->route('trabajadores.index');
    }

    /**
     * @return array<string, array<int, mixed>>
     */
    private function rules(): array
    {
        return [
            'sucursal_id' => ['required', 'integer', Rule::exists('sucursales', 'id')],
            'nombres' => ['required', 'string', 'max:100'],
            'apellidos' => ['required', 'string', 'max:100'],
            'telefono' => ['nullable', 'string', 'max:20'],
            'direccion' => ['nullable', 'string', 'max:255'],
        ];
    }
}
