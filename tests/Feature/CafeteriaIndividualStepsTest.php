<?php

namespace Tests\Feature;

use App\Models\CategoriaProducto;
use App\Models\MovimientoInventario;
use App\Models\Producto;
use App\Models\User;
use App\Models\VentaProducto;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CafeteriaIndividualStepsTest extends TestCase
{
    use RefreshDatabase;

    protected User $user;
    protected CategoriaProducto $categoria;
    protected Producto $producto;

    protected function setUp(): void
    {
        parent::setUp();

        $this->user = User::factory()->create([
            'name' => 'Empleado Cafetería',
            'email' => 'empleado@cine.com',
        ]);

        $this->actingAs($this->user);
    }

    /**
     * Prueba 1: Registrar una categoría.
     */
    public function test_01_registrar_categoria(): CategoriaProducto
    {
        $response = $this->post(route('cafeteria.categorias.store'), [
            'nombre' => 'Bebidas Frías',
            'descripcion' => 'Gaseosas y jugos naturales',
            'activo' => true,
        ]);

        $response->assertSessionHasNoErrors();
        $response->assertStatus(302);

        $categoria = CategoriaProducto::where('nombre', 'Bebidas Frías')->first();
        $this->assertNotNull($categoria);
        $this->assertEquals('Bebidas Frías', $categoria->nombre);

        return $categoria;
    }

    /**
     * Prueba 2: Registrar un producto.
     */
    public function test_02_registrar_producto(): Producto
    {
        $cat = CategoriaProducto::create([
            'nombre' => 'Comidas Rápidas',
            'activo' => true,
        ]);

        $response = $this->post(route('cafeteria.productos.store'), [
            'categoria_producto_id' => $cat->id,
            'nombre' => 'Crispetas Mantequilla Extra',
            'descripcion' => 'Balde grande con mantequilla',
            'precio_venta' => 15000,
            'costo_compra' => 4500,
            'cantidad_disponible' => 0,
            'stock_minimo' => 5,
            'activo' => true,
        ]);

        $response->assertSessionHasNoErrors();
        $response->assertStatus(302);

        $producto = Producto::where('nombre', 'Crispetas Mantequilla Extra')->first();
        $this->assertNotNull($producto);
        $this->assertEquals(0, $producto->cantidad_disponible);

        return $producto;
    }

    /**
     * Prueba 3: Ingresar 20 unidades al inventario.
     */
    public function test_03_ingresar_20_unidades_al_inventario(): Producto
    {
        $cat = CategoriaProducto::create(['nombre' => 'Combos Cine', 'activo' => true]);
        $producto = Producto::create([
            'categoria_producto_id' => $cat->id,
            'nombre' => 'Combo Pareja Extra',
            'precio_venta' => 25000,
            'costo_compra' => 10000,
            'cantidad_disponible' => 0,
            'stock_minimo' => 5,
            'activo' => true,
        ]);

        $response = $this->post(route('cafeteria.inventario.store'), [
            'producto_id' => $producto->id,
            'tipo' => 'entrada',
            'cantidad' => 20,
            'motivo' => 'compra_proveedor',
            'observacion' => 'Ingreso de 20 unidades por pedido',
        ]);

        $response->assertSessionHasNoErrors();
        $producto->refresh();
        $this->assertEquals(20, $producto->cantidad_disponible);

        $movimiento = MovimientoInventario::where('producto_id', $producto->id)->first();
        $this->assertNotNull($movimiento);
        $this->assertEquals('entrada', $movimiento->tipo);
        $this->assertEquals(20, $movimiento->cantidad);
        $this->assertEquals(20, $movimiento->stock_nuevo);

        return $producto;
    }

    /**
     * Prueba 4 y 5: Realizar una venta de 3 unidades y verificar que el inventario quede en 17.
     */
    public function test_04_y_05_venta_3_unidades_inventario_en_17(): void
    {
        $cat = CategoriaProducto::create(['nombre' => 'Gaseosas', 'activo' => true]);
        $producto = Producto::create([
            'categoria_producto_id' => $cat->id,
            'nombre' => 'Gaseosa Manzana 22oz',
            'precio_venta' => 7000,
            'costo_compra' => 2000,
            'cantidad_disponible' => 20,
            'stock_minimo' => 5,
            'activo' => true,
        ]);

        $response = $this->post(route('cafeteria.ventas.store'), [
            'items' => [
                [
                    'producto_id' => $producto->id,
                    'cantidad' => 3,
                ],
            ],
        ]);

        $response->assertSessionHasNoErrors();
        $response->assertStatus(302);

        $producto->refresh();
        // Verificar que el inventario quede en exactamente 17 unidades
        $this->assertEquals(17, $producto->cantidad_disponible);
    }

    /**
     * Prueba 6: Consultar el movimiento de salida.
     */
    public function test_06_consultar_movimiento_de_salida(): void
    {
        $cat = CategoriaProducto::create(['nombre' => 'Gaseosas', 'activo' => true]);
        $producto = Producto::create([
            'categoria_producto_id' => $cat->id,
            'nombre' => 'Gaseosa Sprite 22oz',
            'precio_venta' => 7000,
            'costo_compra' => 2000,
            'cantidad_disponible' => 20,
            'stock_minimo' => 5,
            'activo' => true,
        ]);

        // Realizar venta de 3 unidades
        $this->post(route('cafeteria.ventas.store'), [
            'items' => [
                ['producto_id' => $producto->id, 'cantidad' => 3],
            ],
        ]);

        // Consultar el movimiento de salida
        $movSalida = MovimientoInventario::where('producto_id', $producto->id)
            ->where('tipo', 'salida')
            ->first();

        $this->assertNotNull($movSalida);
        $this->assertEquals(3, $movSalida->cantidad);
        $this->assertEquals('venta', $movSalida->motivo);
        $this->assertEquals(20, $movSalida->stock_anterior);
        $this->assertEquals(17, $movSalida->stock_nuevo);
        $this->assertEquals($this->user->id, $movSalida->user_id);
    }

    /**
     * Prueba 7 y 8: Intentar vender 30 unidades cuando solo existen 17 y verificar rechazo.
     */
    public function test_07_y_08_intentar_vender_30_cuando_hay_17_y_verificar_rechazo(): void
    {
        $cat = CategoriaProducto::create(['nombre' => 'Chocolates', 'activo' => true]);
        $producto = Producto::create([
            'categoria_producto_id' => $cat->id,
            'nombre' => 'Chocolatina Especial',
            'precio_venta' => 5000,
            'costo_compra' => 2000,
            'cantidad_disponible' => 17, // Solo hay 17
            'stock_minimo' => 5,
            'activo' => true,
        ]);

        // Intentar vender 30 unidades
        $response = $this->from(route('cafeteria.pos'))->post(route('cafeteria.ventas.store'), [
            'items' => [
                [
                    'producto_id' => $producto->id,
                    'cantidad' => 30, // Excede existencias
                ],
            ],
        ]);

        // Debe redirigir con error de sesión en 'items'
        $response->assertSessionHasErrors('items');

        // El inventario no debe sufrir ningún descuento
        $producto->refresh();
        $this->assertEquals(17, $producto->cantidad_disponible);

        // No debe haberse creado ninguna venta
        $this->assertEquals(0, VentaProducto::count());
    }

    /**
     * Prueba 9: Consultar el historial de ventas.
     */
    public function test_09_consultar_historial_de_ventas(): void
    {
        $cat = CategoriaProducto::create(['nombre' => 'Snacks', 'activo' => true]);
        $producto = Producto::create([
            'categoria_producto_id' => $cat->id,
            'nombre' => 'Papas Gourmet',
            'precio_venta' => 8000,
            'costo_compra' => 3000,
            'cantidad_disponible' => 10,
            'stock_minimo' => 2,
            'activo' => true,
        ]);

        $this->post(route('cafeteria.ventas.store'), [
            'items' => [
                ['producto_id' => $producto->id, 'cantidad' => 2],
            ],
        ]);

        $venta = VentaProducto::first();
        $this->assertNotNull($venta);

        // Consultar el listado de ventas en la ruta
        $response = $this->get(route('cafeteria.ventas.index'));
        $response->assertStatus(200);

        // Consultar detalle específico
        $responseDetalle = $this->get(route('cafeteria.ventas.show', $venta->id));
        $responseDetalle->assertStatus(200);
    }

    /**
     * Regla adicional: No permitir vender productos inactivos.
     */
    public function test_regla_no_vender_producto_inactivo(): void
    {
        $cat = CategoriaProducto::create(['nombre' => 'Especiales', 'activo' => true]);
        $producto = Producto::create([
            'categoria_producto_id' => $cat->id,
            'nombre' => 'Producto Descontinuado',
            'precio_venta' => 10000,
            'costo_compra' => 4000,
            'cantidad_disponible' => 50,
            'stock_minimo' => 5,
            'activo' => false, // Inactivo
        ]);

        $response = $this->post(route('cafeteria.ventas.store'), [
            'items' => [
                ['producto_id' => $producto->id, 'cantidad' => 1],
            ],
        ]);

        $response->assertSessionHasErrors('items');
        $producto->refresh();
        $this->assertEquals(50, $producto->cantidad_disponible);
    }

    /**
     * Regla adicional: No permitir finalizar venta con carrito vacío.
     */
    public function test_regla_no_permitir_carrito_vacio(): void
    {
        $response = $this->post(route('cafeteria.ventas.store'), [
            'items' => [],
        ]);

        $response->assertSessionHasErrors('items');
    }
}
