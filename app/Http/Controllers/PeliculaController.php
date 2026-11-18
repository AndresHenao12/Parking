<?php

namespace App\Http\Controllers;

use App\Models\Departamentos;
use App\Models\Pelicula;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class PeliculaController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(): Response
    {
        return Inertia::render('Pelicula/Index', [
            'peliculas' => Pelicula::query()
                ->orderBy('titulo')
                ->get(),
            'ubicaciones' => Departamentos::query()
                ->with([
                    'ciudades' => fn ($query) => $query
                        ->select(['id', 'departamento_id', 'nombre'])
                        ->orderBy('nombre'),
                    'ciudades.sucursales' => fn ($query) => $query
                        ->select(['id', 'ciudad_id', 'nombre', 'direccion', 'descripcion'])
                        ->orderBy('nombre'),
                ])
                ->orderBy('nombre')
                ->get(['id', 'nombre']),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate($this->rules());

        Pelicula::create([
            ...$validated,
            'slug' => $this->uniqueSlug($validated['titulo']),
        ]);

        return redirect()->route('peliculas.index');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Pelicula $pelicula): RedirectResponse
    {
        $validated = $request->validate($this->rules());

        $pelicula->update([
            ...$validated,
            'slug' => $this->uniqueSlug($validated['titulo'], $pelicula),
        ]);

        return redirect()->route('peliculas.index');
    }

    public function destroy(Pelicula $pelicula): RedirectResponse
    {
        $pelicula->delete();

        return redirect()->route('peliculas.index');
    }

    /**
     * @return array<string, mixed>
     */
    private function rules(): array
    {
        return [
            'titulo' => ['required', 'string', 'max:150'],
            'director' => ['nullable', 'string', 'max:120'],
            'anio' => ['nullable', 'integer', 'min:1888', 'max:2100'],
            'duracion_minutos' => ['required', 'integer', 'min:1', 'max:65535'],
            'clasificacion' => ['required', Rule::in(array_keys(Pelicula::CLASIFICACIONES))],
            'genero' => ['required', Rule::in(Pelicula::GENEROS)],
            'sinopsis' => ['required', 'string'],
            'imagen' => ['nullable', 'string', 'max:255'],
        ];
    }

    private function uniqueSlug(string $title, ?Pelicula $pelicula = null): string
    {
        $baseSlug = Str::slug($title) ?: 'pelicula';
        $slug = $baseSlug;
        $suffix = 2;

        while (
            Pelicula::query()
                ->where('slug', $slug)
                ->when($pelicula !== null, function ($query) use ($pelicula): void {
                    $query->where('id', '!=', $pelicula->getKey());
                })
                ->exists()
        ) {
            $slug = "{$baseSlug}-{$suffix}";
            $suffix++;
        }

        return $slug;
    }

    public function PeliculasDisponibles(Request $request): Response
    {
        $peliculas = Pelicula::where('estado', 'a')
            ->orderBy('titulo')
            ->get();
    }
}
