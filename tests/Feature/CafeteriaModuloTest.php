<?php

namespace Tests\Feature;

use App\Models\CategoriaProducto;
use App\Models\MovimientoInventario;
use App\Models\Producto;
use App\Models\Trabajadores;
use App\Models\User;
use App\Models\VentaProducto;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CafeteriaModuloTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Prueba secuencial de los 9 pasos del requerimiento.
     */
    public function test_ciclo_completo_cafeteria_pos(): void
    {
        // Usuario autenticado
        $user = User::factory()->create([
            'name' => 'Cajero Test',
            'email' => 'cajero@cine.com',
        ]);

        $this->actingAs($user);

        // PASO 1: Registrar una categoría
        $responseCategoria = $this->post(route('cafeteria.categorias.store'), [
            'nombre' => 'Confitería Especial',
            'descripcion' => 'Golosinas premium importadas y chocolates',
            'activo' => true,
        ]);
        $responseCategoria->assertStatus(302);

        $categoria = CategoriaProducto::where('nombre', 'Confitería Especial')->first();
        $this->assertNotNull($categoria, 'Error en Paso 1: La categoría no se creó.');

        // PASO 2: Registrar un producto
        $responseProducto = $this->post(route('cafeteria.productos.store'), [
            'categoria_producto_id' => $categoria->id,
            'nombre' => 'Crispetas Gourmet Sal Marina',
            'descripcion' => 'Empaque mediano de crispetas artesanales',
            'precio_venta' => 12500,
            'costo_compra' => 4000,
            'cantidad_disponible' => 0,
            'stock_minimo' => 5,
            'activo' => true,
        ]);
        $responseProducto->assertStatus(302);

        $producto = Producto::where('nombre', 'Crispetas Gourmet Sal Marina')->first();
        $this->assertNotNull($producto, 'Error en Paso 2: El producto no se creó.');
        $this->assertEquals(0, $producto->cantidad_disponible, 'El producto nuevo debe iniciar con 0 unidades.');

        // PASO 3: Ingresar 20 unidades al inventario
        $responseEntrada = $this->post(route('cafeteria.inventario.store'), [
            'producto_id' => $producto->id,
            'tipo' => 'entrada',
            'cantidad' => 20,
            'motivo' => 'compra_proveedor',
            'observacion' => 'Ingreso de lote inicial de prueba',
        ]);
        $responseEntrada->assertStatus(302);

        $producto->refresh();
        $this->assertEquals(20, $producto->cantidad_disponible, 'Error en Paso 3: El stock debe ser 20 tras la entrada.');

        // Verificar registro de movimiento de entrada
        $movEntrada = MovimientoInventario::where('producto_id', $producto->id)
            ->where('tipo', 'entrada')
            ->first();
        $this->assertNotNull($movEntrada, 'Debe existir el movimiento de inventario de entrada.');
        $this->assertEquals(20, $movEntrada->cantidad);
        $this->assertEquals(0, $movEntrada->stock_anterior);
        $this->assertEquals(20, $movEntrada->stock_nuevo);
        $this->assertEquals($user->id, $movEntrada->user_id);

        // PASO 4: Realizar una venta de 3 unidades
        $responseVenta = $this->post(route('cafeteria.ventas.store'), [
            'items' => [
                [
                    'producto_id' => $producto->id,
                    'cantidad' => 3,
                ],
            ],
        ]);
        $responseVenta->assertStatus(302);

        // PASO 5: Verificar que el inventario quede en 17 unidades
        $producto->refresh();
        $this->assertEquals(17, $producto->cantidad_disponible, 'Error en Paso 5: El inventario debe quedar en 17 unidades.');

        // PASO 6: Consultar el movimiento de salida
        $movSalida = MovimientoInventario::where('producto_id', $producto->id)
            ->where('tipo', 'salida')
            ->where('motivo', 'venta')
            ->latest('id')
            ->first();

        $this->assertNotNull($movSalida, 'Error en Paso 6: Debe existir un movimiento de salida por venta.');
        $this->assertEquals(3, $movSalida->cantidad, 'La cantidad del movimiento de salida debe ser 3.');
        $this->assertEquals(20, $movSalida->stock_anterior);
        $this->assertEquals(17, $movSalida->stock_nuevo);
        $this->assertNotNull($movSalida->venta_producto_id, 'El movimiento debe estar asociado a una venta.');

        // Verificar la venta registrada
        $venta = VentaProducto::find($movSalida->venta_producto_id);
        $this->assertNotNull($venta, 'La venta debe existir en la base de datos.');
        $this->assertEquals(37500.0, (float) $venta->total, 'El total debe ser 3 * 12500 = 37500.');
        $this->assertEquals(3, $venta->cantidad_productos);
        $this->assertEquals('completada', $venta->estado);

        // PASO 7: Intentar vender 30 unidades cuando solamente existen 17
        $responseVentaExcesiva = $this->from(route('cafeteria.pos'))->post(route('cafeteria.ventas.store'), [
            'items' => [
                [
                    'producto_id' => $producto->id,
                    'cantidad' => 30,
                ],
            ],
        ]);

        // PASO 8: Verificar que el sistema rechace la operación
        $responseVentaExcesiva->assertStatus(302);
        $responseVentaExcesiva->assertSessionHasErrors('items');

        // Verificar que el inventario se mantiene intacto en 17
        $producto->refresh();
        $this->assertEquals(17, $producto->cantidad_disponible, 'Error en Paso 8: El inventario debió permanecer en 17 tras el rechazo.');

        // PASO 9: Consultar el historial de ventas
        $responseHistorial = $this->get(route('cafeteria.ventas.index', [
            'numero_venta' => $venta->numero_venta,
        ]));
        $responseHistorial->assertStatus(200);

        // Consultar el detalle de la venta
        $responseDetalle = $this->get(route('cafeteria.ventas.show', $venta->id));
        $responseDetalle->assertStatus(200);
    }
}
