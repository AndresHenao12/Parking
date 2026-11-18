<?php

namespace App\Http\Controllers;

use App\Models\Celda;
use App\Models\RegistroEstacionamiento;
use App\Models\Trabajadores;
use App\Models\Vehiculo;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(): Response
    {
        $hasVehiculosTable = Schema::hasTable('vehiculos');
        $hasRegistrosTable = Schema::hasTable('registros_estacionamiento');
        $hasCeldasTable = Schema::hasTable('celdas');
        $hasTrabajadoresTable = Schema::hasTable('trabajadores');

        $totalVehiculos = $hasVehiculosTable ? Vehiculo::count() : 0;
        $vehiculosDentro = $hasRegistrosTable ? RegistroEstacionamiento::query()->where('estado', 'activo')->count() : 0;
        $celdasDisponibles = $hasCeldasTable ? Celda::query()->where('estado', 'disponible')->count() : 0;
        $celdasOcupadas = $hasCeldasTable ? Celda::query()->where('estado', 'ocupada')->count() : 0;
        $totalEmpleados = $hasTrabajadoresTable ? Trabajadores::count() : 0;
        $ingresosHoy = $hasRegistrosTable ? (float) RegistroEstacionamiento::query()
            ->where('estado', 'finalizado')
            ->whereDate('hora_salida', Carbon::today())
            ->sum('valor_total') : 0.0;
        $ingresosMes = $hasRegistrosTable ? (float) RegistroEstacionamiento::query()
            ->where('estado', 'finalizado')
            ->whereMonth('hora_salida', Carbon::now()->month)
            ->sum('valor_total') : 0.0;

        $recentEntries = $hasRegistrosTable ? RegistroEstacionamiento::query()
            ->with(['vehiculo', 'celda'])
            ->where('estado', 'activo')
            ->orderByDesc('hora_entrada')
            ->limit(5)
            ->get()
            ->map(fn (RegistroEstacionamiento $registro): array => [
                'id' => $registro->id,
                'vehiculo' => $registro->vehiculo?->placa ?? 'Sin vehículo',
                'celda' => $registro->celda?->codigo ?? 'Sin celda',
                'hora_entrada' => $registro->hora_entrada,
            ]) : [];

        $recentExits = $hasRegistrosTable ? RegistroEstacionamiento::query()
            ->with(['vehiculo', 'celda'])
            ->where('estado', 'finalizado')
            ->orderByDesc('hora_salida')
            ->limit(5)
            ->get()
            ->map(fn (RegistroEstacionamiento $registro): array => [
                'id' => $registro->id,
                'vehiculo' => $registro->vehiculo?->placa ?? 'Sin vehículo',
                'celda' => $registro->celda?->codigo ?? 'Sin celda',
                'valor_total' => (float) $registro->valor_total,
                'hora_salida' => $registro->hora_salida,
            ]) : [];

        $monthlyChart = $hasRegistrosTable ? DB::table('registros_estacionamiento')
            ->selectRaw('strftime("%Y-%m", hora_salida) as month, SUM(valor_total) as total')
            ->whereNotNull('hora_salida')
            ->groupByRaw('strftime("%Y-%m", hora_salida)')
            ->orderBy('month')
            ->limit(6)
            ->get()
            ->map(fn ($item) => [
                'month' => $item->month,
                'total' => (float) $item->total,
            ]) : [];

        return Inertia::render('dashboard', [
            'stats' => [
                'total_vehiculos' => $totalVehiculos,
                'vehiculos_dentro' => $vehiculosDentro,
                'celdas_disponibles' => $celdasDisponibles,
                'celdas_ocupadas' => $celdasOcupadas,
                'total_empleados' => $totalEmpleados,
                'ingresos_hoy' => $ingresosHoy,
                'ingresos_mes' => $ingresosMes,
            ],
            'recentEntries' => $recentEntries,
            'recentExits' => $recentExits,
            'monthlyChart' => $monthlyChart,
        ]);
    }
}
