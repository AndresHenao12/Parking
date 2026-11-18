<?php

namespace App\Http\Controllers;

use App\Models\Funcion;
use App\Models\Pelicula;
use App\Models\Sala;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class FuncionController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Funcion/Index', [
            'funciones' => Funcion::query()
                ->with(['pelicula', 'sala'])
                ->orderBy('fecha')
                ->orderBy('hora_inicio')
                ->get(),
            'peliculas' => Pelicula::query()
                ->where('estado', 'a')
                ->orderBy('titulo')
                ->get(['id', 'titulo']),
            'salas' => Sala::query()
                ->orderBy('nombre')
                ->get(['id', 'nombre']),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate($this->rules());

        Funcion::create($validated);

        return redirect()->route('funciones.index');
    }

    public function update(Request $request, Funcion $funcion): RedirectResponse
    {
        $validated = $request->validate($this->rules());

        $funcion->update($validated);

        return redirect()->route('funciones.index');
    }

    public function destroy(Funcion $funcion): RedirectResponse
    {
        $funcion->delete();

        return redirect()->route('funciones.index');
    }

    public function FuncionesDisponibles($id_pelicula)
    {
        $funciones = Funcion::query()
            ->with(['pelicula', 'sala'])
            ->where('pelicula_id', $id_pelicula)
            ->where('estado', true)
            ->get();

        return response()->json($funciones);
    }

    /**
     * @return array<string, mixed>
     */
    private function rules(): array
    {
        return [
            'pelicula_id' => ['required', 'integer', 'exists:peliculas,id'],
            'sala_id' => ['required', 'integer', 'exists:salas,id'],
            'fecha' => ['required', 'date'],
            'hora_inicio' => ['required', 'date_format:H:i'],
            'hora_fin' => ['required', 'date_format:H:i', 'after:hora_inicio'],
            'precio' => ['required', 'numeric', 'min:0'],
            'estado' => ['required', 'boolean'],
        ];
    }
}
