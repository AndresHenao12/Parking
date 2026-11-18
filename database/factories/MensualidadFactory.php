<?php

namespace Database\Factories;

use App\Models\Mensualidad;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Mensualidad>
 */
class MensualidadFactory extends Factory
{
    protected $model = Mensualidad::class;

    public function definition(): array
    {
        $inicio = fake()->dateTimeBetween('-3 months', 'now');
        $fin = (clone $inicio)->modify('+1 month');

        return [
            'vehiculo_id' => 1,
            'tarifa_id' => 1,
            'valor' => fake()->randomFloat(2, 60000, 300000),
            'fecha_inicio' => $inicio->format('Y-m-d'),
            'fecha_vencimiento' => $fin->format('Y-m-d'),
            'estado' => fake()->randomElement(['vigente', 'vencida', 'desactivada']),
        ];
    }
}
