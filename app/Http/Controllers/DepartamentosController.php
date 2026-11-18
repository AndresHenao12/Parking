<?php

namespace App\Http\Controllers;

use App\Models\Departamentos;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DepartamentosController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(): Response
    {
        return Inertia::render('Departamentos/Index', [
            'records' => Departamentos::query()
                ->withCount('ciudades')
                ->orderBy('nombre')
                ->get()
                ->map(fn (Departamentos $departamento): array => [
                    'id' => (string) $departamento->id,
                    'nombre' => $departamento->nombre,
                    'descripcion' => $departamento->descripcion,
                    'ciudades' => (string) $departamento->ciudades_count,
                ]),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): RedirectResponse
    {
        Departamentos::create($request->validate($this->rules()));

        return redirect()->route('departamentos.index');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Departamentos $departamento): RedirectResponse
    {
        $departamento->update($request->validate($this->rules()));

        return redirect()->route('departamentos.index');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Departamentos $departamento): RedirectResponse
    {
        $departamento->delete();

        return redirect()->route('departamentos.index');
    }

    /**
     * @return array<string, array<int, string>>
     */
    private function rules(): array
    {
        return [
            'nombre' => ['required', 'string', 'max:100'],
            'descripcion' => ['nullable', 'string', 'max:255'],
        ];
    }
}
