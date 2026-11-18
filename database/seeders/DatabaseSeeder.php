<?php

namespace Database\Seeders;

use App\Models\Celda;
use App\Models\Mensualidad;
use App\Models\RegistroEstacionamiento;
use App\Models\Tarifa;
use App\Models\User;
use App\Models\Vehiculo;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    public function run(): void
    {
        User::factory()->create([
            'name' => 'Administrador ParkControl',
            'email' => 'admin@parkcontrol.test',
            'role' => 'admin',
            'password' => Hash::make('password123'),
        ]);

        User::factory()->create([
            'name' => 'Operario ParkControl',
            'email' => 'operario@parkcontrol.test',
            'role' => 'operario',
            'password' => Hash::make('password123'),
        ]);

        $tarifas = [
            ['nombre' => 'Automóvil horario', 'tipo_vehiculo' => 'Automóvil', 'precio_hora' => 2500, 'precio_diario' => 18000],
            ['nombre' => 'Moto horario', 'tipo_vehiculo' => 'Motocicleta', 'precio_hora' => 1200, 'precio_diario' => 9000],
            ['nombre' => 'Camioneta horario', 'tipo_vehiculo' => 'Camioneta', 'precio_hora' => 4000, 'precio_diario' => 25000],
        ];

        foreach ($tarifas as $tarifa) {
            Tarifa::query()->create($tarifa + ['activo' => true]);
        }

        $celdas = ['A-101', 'A-102', 'A-103', 'B-201', 'B-202', 'B-203', 'C-301', 'C-302', 'D-401', 'D-402'];
        $celdaModels = [];

        foreach ($celdas as $index => $codigo) {
            $celdaModels[] = Celda::factory()->create([
                'codigo' => $codigo,
                'tipo_vehiculo' => ['Automóvil', 'Motocicleta', 'Camioneta'][($index % 3)],
                'estado' => $index < 6 ? 'disponible' : 'ocupada',
                'capacidad' => '1 vehículo',
            ]);
        }

        $vehiculos = Vehiculo::factory()->count(20)->create();

        foreach ($vehiculos as $index => $vehiculo) {
            $vehiculo->update([
                'estado' => $index % 4 === 0 ? 'activo' : 'inactivo',
            ]);
        }

        foreach ($vehiculos as $index => $vehiculo) {
            if ($index >= 10) {
                continue;
            }

            $tarifa = Tarifa::query()->where('tipo_vehiculo', $vehiculo->tipo_vehiculo)->first();
            $celda = $celdaModels[$index % count($celdaModels)];
            $fechaEntrada = now()->subHours(rand(1, 12));
            $fechaSalida = $fechaEntrada->copy()->addMinutes(rand(30, 600));

            RegistroEstacionamiento::query()->create([
                'vehiculo_id' => $vehiculo->id,
                'celda_id' => $celda->id,
                'tarifa_id' => $tarifa?->id,
                'hora_entrada' => $fechaEntrada,
                'hora_salida' => $fechaSalida,
                'tiempo_minutos' => $fechaEntrada->diffInMinutes($fechaSalida),
                'valor_total' => $tarifa ? round($tarifa->precio_hora * ($fechaEntrada->diffInMinutes($fechaSalida) / 60), 2) : 0,
                'estado' => 'finalizado',
            ]);

            $celda->update(['estado' => 'disponible']);
            $vehiculo->update(['estado' => 'inactivo']);
        }

        $activeVehiculos = $vehiculos->take(5);
        foreach ($activeVehiculos as $index => $vehiculo) {
            $tarifa = Tarifa::query()->where('tipo_vehiculo', $vehiculo->tipo_vehiculo)->first();
            $celda = $celdaModels[$index + 2];

            RegistroEstacionamiento::query()->create([
                'vehiculo_id' => $vehiculo->id,
                'celda_id' => $celda->id,
                'tarifa_id' => $tarifa?->id,
                'hora_entrada' => now()->subMinutes(rand(10, 240)),
                'hora_salida' => null,
                'tiempo_minutos' => 0,
                'valor_total' => 0,
                'estado' => 'activo',
            ]);

            $celda->update(['estado' => 'ocupada']);
            $vehiculo->update(['estado' => 'activo']);
        }

        foreach ($vehiculos->take(7) as $index => $vehiculo) {
            Mensualidad::query()->create([
                'vehiculo_id' => $vehiculo->id,
                'tarifa_id' => Tarifa::query()->where('tipo_vehiculo', $vehiculo->tipo_vehiculo)->value('id'),
                'valor' => 120000 + ($index * 15000),
                'fecha_inicio' => now()->subDays(20)->format('Y-m-d'),
                'fecha_vencimiento' => now()->addDays(10 + $index)->format('Y-m-d'),
                'estado' => $index % 2 === 0 ? 'vigente' : 'vencida',
            ]);
        }
    }
}
