<?php

namespace App\Http\Controllers;

use App\Models\CategoriaProducto;
use App\Models\DetalleVentaProducto;
use App\Models\MovimientoInventario;
use App\Models\Producto;
use App\Models\Trabajadores;
use App\Models\VentaProducto;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class VentaProductoController extends Controller
{
    /**
     * Pantalla de punto de venta (POS) para atención rápida.
     */
    public function pos(): Response
    {
        $categorias = CategoriaProducto::query()
            ->where('activo', true)
            ->orderBy('nombre')
            ->get(['id', 'nombre']);

        $productos = Producto::query()
            ->with('categoria:id,nombre')
            ->where('activo', true)
            ->orderBy('nombre')
            ->get();

        $trabajadores = Trabajadores::query()
            ->orderBy('nombres')
            ->get(['id', 'nombres', 'apellidos']);

        return Inertia::render('Cafeteria/Pos', [
            'categorias' => $categorias,
            'productos' => $productos,
            'trabajadores' => $trabajadores,
            'usuarioActual' => auth()->user(),
        ]);
    }

    /**
     * Procesa y finaliza una venta bajo transacción de base de datos con bloqueo pesimista.
     */
    public function store(Request $request): RedirectResponse|JsonResponse
    {
        $request->validate([
            'items' => ['required', 'array', 'min:1'],
            'items.*.producto_id' => ['required', 'integer', 'exists:productos,id'],
            'items.*.cantidad' => ['required', 'integer', 'min:1'],
            'trabajador_id' => ['nullable', 'integer', 'exists:trabajadores,id'],
        ], [
            'items.required' => 'El carrito de compras no puede estar vacío.',
            'items.min' => 'Debes agregar al menos un producto para finalizar la venta.',
            'items.*.cantidad.min' => 'La cantidad de cada producto debe ser mayor a cero.',
        ]);

        $itemsPayload = $request->input('items');
        $trabajadorId = $request->input('trabajador_id');
        $userId = auth()->id() ?? 1;

        $venta = DB::transaction(function () use ($itemsPayload, $trabajadorId, $userId) {
            $totalVenta = 0.0;
            $subtotalVenta = 0.0;
            $cantidadTotalProductos = 0;
            $detallesParaCrear = [];
            $movimientosParaCrear = [];

            // Consolidar cantidades por producto_id en caso de duplicados en el payload
            $cantidadesPorProducto = [];
            foreach ($itemsPayload as $item) {
                $pid = (int) $item['producto_id'];
                $cant = (int) $item['cantidad'];
                if ($cant <= 0) {
                    throw ValidationException::withMessages([
                        'items' => 'No se permiten cantidades menores o iguales a cero.',
                    ]);
                }
                $cantidadesPorProducto[$pid] = ($cantidadesPorProducto[$pid] ?? 0) + $cant;
            }

            // Ordenar por ID para prevenir deadlocks en transacciones concurrentes
            ksort($cantidadesPorProducto);

            // Bloquear productos en la base de datos para lectura y actualización
            $productos = Producto::whereIn('id', array_keys($cantidadesPorProducto))
                ->lockForUpdate()
                ->get()
                ->keyBy('id');

            foreach ($cantidadesPorProducto as $productoId => $cantidadSolicitada) {
                $producto = $productos->get($productoId);

                if (! $producto) {
                    throw ValidationException::withMessages([
                        'items' => "El producto con ID {$productoId} no existe.",
                    ]);
                }

                if (! $producto->activo) {
                    throw ValidationException::withMessages([
                        'items' => "El producto '{$producto->nombre}' se encuentra inactivo y no se puede vender.",
                    ]);
                }

                if ($producto->cantidad_disponible < $cantidadSolicitada) {
                    throw ValidationException::withMessages([
                        'items' => "Inventario insuficiente para '{$producto->nombre}'. Existencias disponibles: {$producto->cantidad_disponible}, solicitadas: {$cantidadSolicitada}.",
                    ]);
                }

                $precioUnitario = (float) $producto->precio_venta;
                $costoUnitario = (float) $producto->costo_compra;
                $subtotalLinea = round($precioUnitario * $cantidadSolicitada, 2);

                $totalVenta += $subtotalLinea;
                $subtotalVenta += $subtotalLinea;
                $cantidadTotalProductos += $cantidadSolicitada;

                $stockAnterior = $producto->cantidad_disponible;
                $stockNuevo = $stockAnterior - $cantidadSolicitada;

                // Descontar existencias del producto
                $producto->cantidad_disponible = $stockNuevo;
                $producto->save();

                $detallesParaCrear[] = [
                    'producto_id' => $producto->id,
                    'cantidad' => $cantidadSolicitada,
                    'precio_unitario' => $precioUnitario,
                    'costo_unitario' => $costoUnitario,
                    'subtotal' => $subtotalLinea,
                ];

                $movimientosParaCrear[] = [
                    'producto_id' => $producto->id,
                    'tipo' => 'salida',
                    'cantidad' => $cantidadSolicitada,
                    'stock_anterior' => $stockAnterior,
                    'stock_nuevo' => $stockNuevo,
                    'motivo' => 'venta',
                    'observacion' => 'Descuento automático por venta POS',
                    'user_id' => $userId,
                    'trabajador_id' => $trabajadorId,
                ];
            }

            // Generar número de venta correlativo diario: VTA-YYYYMMDD-0001
            $fechaHoy = Carbon::now()->format('Ymd');
            $prefijo = "VTA-{$fechaHoy}-";
            $ultimaVenta = VentaProducto::where('numero_venta', 'like', "{$prefijo}%")
                ->orderByDesc('id')
                ->lockForUpdate()
                ->first();

            $correlativo = 1;
            if ($ultimaVenta) {
                $ultimoNumero = (int) substr($ultimaVenta->numero_venta, strlen($prefijo));
                $correlativo = $ultimoNumero + 1;
            }
            $numeroVenta = $prefijo . str_pad((string) $correlativo, 4, '0', STR_PAD_LEFT);

            // Crear registro principal de la venta
            $venta = VentaProducto::create([
                'numero_venta' => $numeroVenta,
                'user_id' => $userId,
                'trabajador_id' => $trabajadorId,
                'subtotal' => $subtotalVenta,
                'total' => $totalVenta,
                'cantidad_productos' => $cantidadTotalProductos,
                'estado' => 'completada',
                'fecha_venta' => Carbon::now(),
            ]);

            // Guardar detalles de venta
            foreach ($detallesParaCrear as $detalle) {
                $detalle['venta_producto_id'] = $venta->id;
                DetalleVentaProducto::create($detalle);
            }

            // Guardar movimientos de inventario asociados a la venta
            foreach ($movimientosParaCrear as $movimiento) {
                $movimiento['venta_producto_id'] = $venta->id;
                $movimiento['fecha'] = $venta->fecha_venta;
                MovimientoInventario::create($movimiento);
            }

            return $venta;
        });

        if ($request->wantsJson()) {
            return response()->json([
                'success' => true,
                'message' => "Venta {$venta->numero_venta} realizada exitosamente.",
                'venta' => $venta->load(['detalles.producto', 'trabajador', 'user']),
            ]);
        }

        return redirect()->route('cafeteria.pos')
            ->with('success', "Venta {$venta->numero_venta} registrada exitosamente por \${$venta->total}.");
    }

    /**
     * Listado e historial de ventas con filtros de búsqueda y fechas.
     */
    public function index(Request $request): Response
    {
        $numeroVenta = $request->input('numero_venta');
        $fechaInicio = $request->input('fecha_inicio');
        $fechaFin = $request->input('fecha_fin');
        $trabajadorId = $request->input('trabajador_id');
        $estado = $request->input('estado');

        $query = VentaProducto::query()
            ->with(['user', 'trabajador', 'detalles.producto'])
            ->orderByDesc('fecha_venta')
            ->orderByDesc('id');

        if ($numeroVenta) {
            $query->where('numero_venta', 'like', "%{$numeroVenta}%");
        }

        if ($fechaInicio) {
            $query->whereDate('fecha_venta', '>=', $fechaInicio);
        }

        if ($fechaFin) {
            $query->whereDate('fecha_venta', '<=', $fechaFin);
        }

        if ($trabajadorId) {
            $query->where('trabajador_id', $trabajadorId);
        }

        if ($estado) {
            $query->where('estado', $estado);
        }

        $ventas = $query->paginate(20)->withQueryString();

        $trabajadores = Trabajadores::query()
            ->orderBy('nombres')
            ->get(['id', 'nombres', 'apellidos']);

        $totalVendidoPeriodo = (float) (clone $query)->where('estado', 'completada')->sum('total');
        $totalItemsPeriodo = (int) (clone $query)->where('estado', 'completada')->sum('cantidad_productos');

        return Inertia::render('Cafeteria/Ventas/Index', [
            'ventas' => $ventas,
            'trabajadores' => $trabajadores,
            'filtros' => [
                'numero_venta' => $numeroVenta ?? '',
                'fecha_inicio' => $fechaInicio ?? '',
                'fecha_fin' => $fechaFin ?? '',
                'trabajador_id' => $trabajadorId ?? '',
                'estado' => $estado ?? '',
            ],
            'totales' => [
                'total_vendido' => $totalVendidoPeriodo,
                'total_items' => $totalItemsPeriodo,
            ],
        ]);
    }

    /**
     * Consulta detallada de una venta específica.
     */
    public function show(VentaProducto $venta): JsonResponse|Response
    {
        $venta->load(['detalles.producto.categoria', 'user', 'trabajador', 'movimientos']);

        if (request()->wantsJson()) {
            return response()->json($venta);
        }

        return Inertia::render('Cafeteria/Ventas/Show', [
            'venta' => $venta,
        ]);
    }
}
