<?php

namespace App\Http\Controllers;

use App\Models\Ciudades;
use App\Models\Departamentos;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class CiudadesController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(): Response
    {
        return Inertia::render('Ciudades/Index', [
            'records' => Ciudades::query()
                ->with('departamento:id,nombre')
                ->orderBy('nombre')
                ->get()
                ->map(fn (Ciudades $ciudad): array => [
                    'id' => (string) $ciudad->id,
                    'departamento_id' => (string) $ciudad->departamento_id,
                    'departamento' => $ciudad->departamento->nombre,
                    'nombre' => $ciudad->nombre,
                    'descripcion' => $ciudad->descripcion,
                ]),
            'departamentos' => Departamentos::query()->orderBy('nombre')->get(['id', 'nombre']),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): RedirectResponse
    {
        Ciudades::create($request->validate($this->rules()));

        return redirect()->route('ciudades.index');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Ciudades $ciudad): RedirectResponse
    {
        $ciudad->update($request->validate($this->rules()));

        return redirect()->route('ciudades.index');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Ciudades $ciudad): RedirectResponse
    {
        $ciudad->delete();

        return redirect()->route('ciudades.index');
    }

    /**
     * @return array<string, array<int, mixed>>
     */
    private function rules(): array
    {
        return [
            'departamento_id' => ['required', 'integer', Rule::exists('departamentos', 'id')],
            'nombre' => ['required', 'string', 'max:100'],
            'descripcion' => ['nullable', 'string', 'max:255'],
        ];
    }
}
