<?php

namespace App\Http\Controllers;

use App\Models\CategoriaProducto;
use App\Models\MovimientoInventario;
use App\Models\Producto;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class ProductoController extends Controller
{
    public function index(Request $request): Response
    {
        $query = Producto::query()->with('categoria');

        if ($search = $request->input('search')) {
            $query->where('nombre', 'like', "%{$search}%");
        }

        if ($categoriaId = $request->input('categoria_id')) {
            $query->where('categoria_producto_id', $categoriaId);
        }

        if ($request->filled('activo')) {
            $query->where('activo', filter_var($request->input('activo'), FILTER_VALIDATE_BOOLEAN));
        }

        if ($request->boolean('stock_bajo')) {
            $query->whereColumn('cantidad_disponible', '<=', 'stock_minimo');
        }

        $productos = $query->orderBy('nombre')->get();
        $categorias = CategoriaProducto::query()->where('activo', true)->orderBy('nombre')->get();

        $alertaStockBajo = Producto::query()
            ->where('activo', true)
            ->whereColumn('cantidad_disponible', '<=', 'stock_minimo')
            ->count();

        return Inertia::render('Cafeteria/Productos/Index', [
            'productos' => $productos,
            'categorias' => $categorias,
            'filtros' => [
                'search' => $request->input('search', ''),
                'categoria_id' => $request->input('categoria_id', ''),
                'activo' => $request->input('activo', ''),
                'stock_bajo' => $request->boolean('stock_bajo'),
            ],
            'alertaStockBajo' => $alertaStockBajo,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'categoria_producto_id' => ['required', 'integer', Rule::exists('categorias_productos', 'id')],
            'nombre' => ['required', 'string', 'max:150', 'unique:productos,nombre'],
            'descripcion' => ['nullable', 'string'],
            'precio_venta' => ['required', 'numeric', 'min:0'],
            'costo_compra' => ['required', 'numeric', 'min:0'],
            'cantidad_disponible' => ['nullable', 'integer', 'min:0'],
            'stock_minimo' => ['nullable', 'integer', 'min:0'],
            'activo' => ['nullable', 'boolean'],
            'imagen' => ['nullable'],
        ]);

        $imagenPath = null;
        if ($request->hasFile('imagen')) {
            $request->validate(['imagen' => ['image', 'max:2048']]);
            $path = $request->file('imagen')->store('productos', 'public');
            $imagenPath = Storage::url($path);
        } elseif (is_string($request->input('imagen')) && !empty($request->input('imagen'))) {
            $imagenPath = $request->input('imagen');
        }

        $initialStock = (int) ($validated['cantidad_disponible'] ?? 0);

        DB::transaction(function () use ($validated, $imagenPath, $initialStock) {
            $producto = Producto::create([
                'categoria_producto_id' => $validated['categoria_producto_id'],
                'nombre' => $validated['nombre'],
                'descripcion' => $validated['descripcion'] ?? null,
                'precio_venta' => $validated['precio_venta'],
                'costo_compra' => $validated['costo_compra'],
                'cantidad_disponible' => $initialStock,
                'stock_minimo' => $validated['stock_minimo'] ?? 5,
                'activo' => $validated['activo'] ?? true,
                'imagen' => $imagenPath,
            ]);

            if ($initialStock > 0) {
                MovimientoInventario::create([
                    'producto_id' => $producto->id,
                    'tipo' => 'entrada',
                    'cantidad' => $initialStock,
                    'stock_anterior' => 0,
                    'stock_nuevo' => $initialStock,
                    'motivo' => 'inventario_inicial',
                    'observacion' => 'Ingreso de inventario al crear el producto.',
                    'user_id' => auth()->id() ?? 1,
                    'fecha' => Carbon::now(),
                ]);
            }
        });

        return redirect()->route('cafeteria.productos.index')
            ->with('success', 'Producto registrado correctamente.');
    }

    public function update(Request $request, Producto $producto): RedirectResponse
    {
        $validated = $request->validate([
            'categoria_producto_id' => ['required', 'integer', Rule::exists('categorias_productos', 'id')],
            'nombre' => ['required', 'string', 'max:150', Rule::unique('productos', 'nombre')->ignore($producto->id)],
            'descripcion' => ['nullable', 'string'],
            'precio_venta' => ['required', 'numeric', 'min:0'],
            'costo_compra' => ['required', 'numeric', 'min:0'],
            'stock_minimo' => ['required', 'integer', 'min:0'],
            'activo' => ['required', 'boolean'],
            'imagen' => ['nullable'],
        ]);

        $imagenPath = $producto->imagen;
        if ($request->hasFile('imagen')) {
            $request->validate(['imagen' => ['image', 'max:2048']]);
            $path = $request->file('imagen')->store('productos', 'public');
            $imagenPath = Storage::url($path);
        } elseif ($request->has('imagen') && is_string($request->input('imagen'))) {
            $imagenPath = $request->input('imagen');
        }

        $producto->update([
            'categoria_producto_id' => $validated['categoria_producto_id'],
            'nombre' => $validated['nombre'],
            'descripcion' => $validated['descripcion'] ?? null,
            'precio_venta' => $validated['precio_venta'],
            'costo_compra' => $validated['costo_compra'],
            'stock_minimo' => $validated['stock_minimo'],
            'activo' => $validated['activo'],
            'imagen' => $imagenPath,
        ]);

        return redirect()->route('cafeteria.productos.index')
            ->with('success', 'Producto actualizado correctamente.');
    }

    public function destroy(Producto $producto): RedirectResponse
    {
        if ($producto->detallesVenta()->exists()) {
            $producto->update(['activo' => false]);
            return back()->with('info', 'El producto cuenta con ventas asociadas; se ha marcado como Inactivo para preservar el historial.');
        }

        $producto->delete();

        return back()->with('success', 'Producto eliminado exitosamente.');
    }

    public function toggleActivo(Producto $producto): RedirectResponse
    {
        $producto->update(['activo' => !$producto->activo]);

        $msg = $producto->activo ? 'Producto activado.' : 'Producto desactivado.';
        return back()->with('success', $msg);
    }
}
