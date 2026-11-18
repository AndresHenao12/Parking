<?php

namespace Database\Factories;

use App\Models\Tarifa;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Tarifa>
 */
class TarifaFactory extends Factory
{
    protected $model = Tarifa::class;

    public function definition(): array
    {
        return [
            'nombre' => fake()->randomElement(['Estándar', 'Moto', 'Camioneta', 'Mensual']),
            'tipo_vehiculo' => fake()->randomElement(['Automóvil', 'Motocicleta', 'Camioneta']),
            'precio_hora' => fake()->randomFloat(2, 1500, 8000),
            'precio_diario' => fake()->randomFloat(2, 15000, 60000),
            'activo' => true,
        ];
    }
}
