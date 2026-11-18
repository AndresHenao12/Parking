<?php

namespace App\Http\Controllers;

use App\Models\Celda;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class CeldaController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Park/Celdas/Index', [
            'records' => Celda::query()
                ->orderBy('codigo')
                ->get()
                ->map(fn (Celda $celda): array => [
                    'id' => (string) $celda->id,
                    'codigo' => $celda->codigo,
                    'tipo_vehiculo' => $celda->tipo_vehiculo,
                    'estado' => $celda->estado,
                    'capacidad' => $celda->capacidad,
                    'descripcion' => $celda->descripcion,
                ]),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        Celda::create($request->validate($this->rules()));

        return redirect()->route('celdas.index');
    }

    public function update(Request $request, Celda $celda): RedirectResponse
    {
        $celda->update($request->validate($this->rules($celda)));

        return redirect()->route('celdas.index');
    }

    public function destroy(Celda $celda): RedirectResponse
    {
        $celda->delete();

        return redirect()->route('celdas.index');
    }

    /**
     * @return array<string, array<int, mixed>>
     */
    private function rules(?Celda $celda = null): array
    {
        return [
            'codigo' => ['required', 'string', 'max:30', Rule::unique('celdas', 'codigo')->ignore($celda?->id)],
            'tipo_vehiculo' => ['required', 'string', 'max:30'],
            'estado' => ['required', 'string', 'in:disponible,ocupada,mantenimiento'],
            'capacidad' => ['nullable', 'string', 'max:50'],
            'descripcion' => ['nullable', 'string'],
        ];
    }
}
