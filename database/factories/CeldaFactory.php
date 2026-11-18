<?php

namespace Database\Factories;

use App\Models\Celda;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Celda>
 */
class CeldaFactory extends Factory
{
    protected $model = Celda::class;

    public function definition(): array
    {
        return [
            'codigo' => 'A-'.fake()->numberBetween(1, 200),
            'tipo_vehiculo' => fake()->randomElement(['Automóvil', 'Motocicleta', 'Camioneta']),
            'estado' => fake()->randomElement(['disponible', 'ocupada', 'mantenimiento']),
            'capacidad' => '1 vehículo',
            'descripcion' => fake()->optional()->sentence(),
        ];
    }
}
