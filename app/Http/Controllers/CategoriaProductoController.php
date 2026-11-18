<?php

namespace App\Http\Controllers;

use App\Models\CategoriaProducto;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class CategoriaProductoController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Cafeteria/Categorias/Index', [
            'categorias' => CategoriaProducto::query()
                ->withCount('productos')
                ->orderBy('nombre')
                ->get(),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'nombre' => ['required', 'string', 'max:100', 'unique:categorias_productos,nombre'],
            'descripcion' => ['nullable', 'string'],
            'activo' => ['boolean'],
        ]);

        CategoriaProducto::create($validated);

        return back()->with('success', 'Categoría creada exitosamente.');
    }

    public function update(Request $request, CategoriaProducto $categoria): RedirectResponse
    {
        $validated = $request->validate([
            'nombre' => ['required', 'string', 'max:100', Rule::unique('categorias_productos', 'nombre')->ignore($categoria->id)],
            'descripcion' => ['nullable', 'string'],
            'activo' => ['boolean'],
        ]);

        $categoria->update($validated);

        return back()->with('success', 'Categoría actualizada exitosamente.');
    }

    public function destroy(CategoriaProducto $categoria): RedirectResponse
    {
        if ($categoria->productos()->exists()) {
            return back()->withErrors([
                'error' => 'No se puede eliminar la categoría porque tiene productos asociados. Desactívala en su lugar.',
            ]);
        }

        $categoria->delete();

        return back()->with('success', 'Categoría eliminada exitosamente.');
    }
}
