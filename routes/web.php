<?php

use App\Http\Controllers\CategoriaProductoController;
use App\Http\Controllers\CeldaController;
use App\Http\Controllers\CiudadesController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\DepartamentosController;
use App\Http\Controllers\FuncionController;
use App\Http\Controllers\InventarioController;
use App\Http\Controllers\MensualidadController;
use App\Http\Controllers\PagoController;
use App\Http\Controllers\PeliculaController;
use App\Http\Controllers\ProductoController;
use App\Http\Controllers\RegistroEstacionamientoController;
use App\Http\Controllers\ReporteController;
use App\Http\Controllers\SucursalesController;
use App\Http\Controllers\TarifaController;
use App\Http\Controllers\TrabajadoresController;
use App\Http\Controllers\UsuarioController;
use App\Http\Controllers\VehiculoController;
use App\Http\Controllers\VentaProductoController;
use App\Http\Middleware\VerifyCsrfToken;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome')->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
    Route::post('/pagos/iniciar', [PagoController::class, 'iniciarPago']);
    Route::get('/pago/exitoso', [PagoController::class, 'exitoso'])->name('pagos.exitoso');
    Route::get('/pago/cancelado', [PagoController::class, 'cancelado'])->name('pagos.cancelado');
    Route::get('/compras/{compra}/boletas/pdf', [PagoController::class, 'descargarBoletasPdf'])->name('compras.boletas.pdf');
});

Route::post('/stripe/webhook', [PagoController::class, 'webhook'])
    ->withoutMiddleware([VerifyCsrfToken::class]);

Route::resource('peliculas', PeliculaController::class)->only(['index', 'store', 'update', 'destroy']);
Route::resource('funciones', FuncionController::class)
    ->only(['index', 'store', 'update', 'destroy'])
    ->parameters(['funciones' => 'funcion']);
Route::resource('departamentos', DepartamentosController::class)
    ->only(['index', 'store', 'update', 'destroy'])
    ->parameters(['departamentos' => 'departamento']);
Route::resource('ciudades', CiudadesController::class)
    ->only(['index', 'store', 'update', 'destroy'])
    ->parameters(['ciudades' => 'ciudad']);
Route::resource('sucursales', SucursalesController::class)
    ->only(['index', 'store', 'update', 'destroy'])
    ->parameters(['sucursales' => 'sucursal']);
Route::resource('trabajadores', TrabajadoresController::class)
    ->only(['index', 'store', 'update', 'destroy'])
    ->parameters(['trabajadores' => 'trabajador']);
Route::get('peliculasdisponibles', [PeliculaController::class, 'PeliculasDisponibles']);
Route::get('funcionesdisponibles/{id_pelicula}', [FuncionController::class, 'FuncionesDisponibles']);

Route::middleware(['auth'])->group(function () {
    Route::resource('vehiculos', VehiculoController::class)->only(['index', 'store', 'update', 'destroy'])->parameters(['vehiculos' => 'vehiculo']);
    Route::resource('celdas', CeldaController::class)->only(['index', 'store', 'update', 'destroy'])->parameters(['celdas' => 'celda']);
    Route::resource('tarifas', TarifaController::class)->only(['index', 'store', 'update', 'destroy'])->parameters(['tarifas' => 'tarifa']);
    Route::resource('registros', RegistroEstacionamientoController::class)->only(['index', 'store', 'update', 'destroy'])->parameters(['registros' => 'registro']);
    Route::resource('mensualidades', MensualidadController::class)->only(['index', 'store', 'update', 'destroy'])->parameters(['mensualidades' => 'mensualidad']);
    Route::resource('usuarios', UsuarioController::class)->only(['index', 'store', 'update', 'destroy'])->parameters(['usuarios' => 'usuario']);
    Route::get('/reportes', [ReporteController::class, 'index'])->name('reportes.index');
});

Route::middleware(['auth'])->prefix('cafeteria')->name('cafeteria.')->group(function () {
    // POS Cafetería
    Route::get('/pos', [VentaProductoController::class, 'pos'])->name('pos');
    Route::post('/ventas', [VentaProductoController::class, 'store'])->name('ventas.store');
    Route::get('/ventas', [VentaProductoController::class, 'index'])->name('ventas.index');
    Route::get('/ventas/{venta}', [VentaProductoController::class, 'show'])->name('ventas.show');

    // Gestión de Productos
    Route::post('/productos/{producto}/toggle', [ProductoController::class, 'toggleActivo'])->name('productos.toggle');
    Route::resource('productos', ProductoController::class)->except(['create', 'edit', 'show'])->parameters(['productos' => 'producto']);

    // Categorías de Productos
    Route::resource('categorias', CategoriaProductoController::class)->except(['create', 'edit', 'show'])->parameters(['categorias' => 'categoria']);

    // Inventario y Movimientos
    Route::get('/inventario', [InventarioController::class, 'index'])->name('inventario.index');
    Route::post('/inventario/movimientos', [InventarioController::class, 'storeMovimiento'])->name('inventario.store');
});

require __DIR__.'/settings.php';
