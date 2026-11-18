<?php

namespace Database\Factories;

use App\Models\RegistroEstacionamiento;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<RegistroEstacionamiento>
 */
class RegistroEstacionamientoFactory extends Factory
{
    protected $model = RegistroEstacionamiento::class;

    public function definition(): array
    {
        $entrada = fake()->dateTimeBetween('-7 days', 'now');
        $salida = fake()->dateTimeBetween($entrada, '+2 days');

        return [
            'vehiculo_id' => 1,
            'celda_id' => 1,
            'tarifa_id' => 1,
            'hora_entrada' => $entrada,
            'hora_salida' => $salida,
            'tiempo_minutos' => $entrada->diffInMinutes($salida),
            'valor_total' => fake()->randomFloat(2, 5000, 200000),
            'estado' => fake()->randomElement(['activo', 'finalizado']),
        ];
    }
}
