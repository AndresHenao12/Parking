<?php

namespace Database\Seeders;

use App\Models\CategoriaProducto;
use App\Models\MovimientoInventario;
use App\Models\Producto;
use App\Models\Trabajadores;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class CafeteriaSeeder extends Seeder
{
    public function run(): void
    {
        $categoriasData = [
            ['nombre' => 'Bebidas', 'descripcion' => 'Gaseosas, aguas, jugos y bebidas refrescantes.', 'activo' => true],
            ['nombre' => 'Comidas', 'descripcion' => 'Crispetas de sal y dulces, perros calientes, nachos y snacks calientes.', 'activo' => true],
            ['nombre' => 'Dulces', 'descripcion' => 'Chocolates, gomitas, confitería y paquetes de golosinas.', 'activo' => true],
            ['nombre' => 'Combos', 'descripcion' => 'Combos especiales con crispetas, gaseosas y golosinas a precio especial.', 'activo' => true],
        ];

        $categorias = [];
        foreach ($categoriasData as $item) {
            $categorias[$item['nombre']] = CategoriaProducto::firstOrCreate(
                ['nombre' => $item['nombre']],
                $item
            );
        }

        $adminUser = User::first() ?? User::factory()->create([
            'name' => 'Administrador Cine',
            'email' => 'admin@cine.com',
            'password' => bcrypt('password'),
        ]);

        $trabajador = Trabajadores::first();

        $productosData = [
            [
                'categoria' => 'Comidas',
                'nombre' => 'Crispetas Grandes de Sal',
                'descripcion' => 'Balde de crispetas de sal recién preparadas tamaño grande (150g).',
                'precio_venta' => 14000,
                'costo_compra' => 4500,
                'cantidad_disponible' => 50,
                'stock_minimo' => 10,
                'activo' => true,
                'imagen' => 'https://images.unsplash.com/photo-1578849278619-e73505e9610f?auto=format&fit=crop&w=600&q=80',
            ],
            [
                'categoria' => 'Comidas',
                'nombre' => 'Crispetas Medianas de Mantequilla',
                'descripcion' => 'Balde mediano con doble mantequilla artesanal.',
                'precio_venta' => 11500,
                'costo_compra' => 3800,
                'cantidad_disponible' => 40,
                'stock_minimo' => 8,
                'activo' => true,
                'imagen' => 'https://images.unsplash.com/photo-1585647347483-22b66260dfff?auto=format&fit=crop&w=600&q=80',
            ],
            [
                'categoria' => 'Comidas',
                'nombre' => 'Nachos con Queso Cheddar',
                'descripcion' => 'Crujientes totopos de maíz acompañados con salsa cheddar caliente y jalapeños.',
                'precio_venta' => 13500,
                'costo_compra' => 5000,
                'cantidad_disponible' => 25,
                'stock_minimo' => 5,
                'activo' => true,
                'imagen' => 'https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?auto=format&fit=crop&w=600&q=80',
            ],
            [
                'categoria' => 'Bebidas',
                'nombre' => 'Gaseosa Dispensador 22oz',
                'descripcion' => 'Gaseosa helada en vaso de 22 onzas (Coca-Cola, Sprite, Cuatro).',
                'precio_venta' => 7500,
                'costo_compra' => 2200,
                'cantidad_disponible' => 80,
                'stock_minimo' => 15,
                'activo' => true,
                'imagen' => 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=600&q=80',
            ],
            [
                'categoria' => 'Bebidas',
                'nombre' => 'Agua Mineral Manantial 600ml',
                'descripcion' => 'Agua pura de manantial sin gas 600ml.',
                'precio_venta' => 5500,
                'costo_compra' => 1800,
                'cantidad_disponible' => 60,
                'stock_minimo' => 12,
                'activo' => true,
                'imagen' => 'https://images.unsplash.com/photo-1523362628745-0c100150b504?auto=format&fit=crop&w=600&q=80',
            ],
            [
                'categoria' => 'Dulces',
                'nombre' => 'Chocolatina Jet Gigante',
                'descripcion' => 'Chocolatina tradicional con leche sabor chocolate de 100g.',
                'precio_venta' => 6000,
                'costo_compra' => 2500,
                'cantidad_disponible' => 35,
                'stock_minimo' => 10,
                'activo' => true,
                'imagen' => 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?auto=format&fit=crop&w=600&q=80',
            ],
            [
                'categoria' => 'Dulces',
                'nombre' => 'Gomitas Trululu Aros 90g',
                'descripcion' => 'Gomitas ácidas de sabores surtidos.',
                'precio_venta' => 4500,
                'costo_compra' => 1900,
                'cantidad_disponible' => 4, // Intencionalmente stock bajo para probar alertas
                'stock_minimo' => 8,
                'activo' => true,
                'imagen' => 'https://images.unsplash.com/photo-1582058091505-f87a2e55a40f?auto=format&fit=crop&w=600&q=80',
            ],
            [
                'categoria' => 'Combos',
                'nombre' => 'Combo Pareja Cine',
                'descripcion' => '1 Crispeta Grande + 2 Gaseosas 22oz + 1 Chocolatina.',
                'precio_venta' => 28000,
                'costo_compra' => 11000,
                'cantidad_disponible' => 30,
                'stock_minimo' => 5,
                'activo' => true,
                'imagen' => 'https://images.unsplash.com/photo-1585647347483-22b66260dfff?auto=format&fit=crop&w=600&q=80',
            ],
        ];

        foreach ($productosData as $pData) {
            $cat = $categorias[$pData['categoria']];
            $initialStock = $pData['cantidad_disponible'];

            $producto = Producto::firstOrCreate(
                ['nombre' => $pData['nombre']],
                [
                    'categoria_producto_id' => $cat->id,
                    'descripcion' => $pData['descripcion'],
                    'precio_venta' => $pData['precio_venta'],
                    'costo_compra' => $pData['costo_compra'],
                    'cantidad_disponible' => $initialStock,
                    'stock_minimo' => $pData['stock_minimo'],
                    'activo' => $pData['activo'],
                    'imagen' => $pData['imagen'],
                ]
            );

            // Registrar movimiento inicial si no existe
            if ($initialStock > 0 && !MovimientoInventario::where('producto_id', $producto->id)->exists()) {
                MovimientoInventario::create([
                    'producto_id' => $producto->id,
                    'tipo' => 'entrada',
                    'cantidad' => $initialStock,
                    'stock_anterior' => 0,
                    'stock_nuevo' => $initialStock,
                    'motivo' => 'inventario_inicial',
                    'observacion' => 'Carga de inventario inicial del sistema.',
                    'user_id' => $adminUser->id,
                    'trabajador_id' => $trabajador?->id,
                    'fecha' => Carbon::now(),
                ]);
            }
        }
    }
}
