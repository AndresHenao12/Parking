<?php

namespace Database\Factories;

use App\Models\Vehiculo;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Vehiculo>
 */
class VehiculoFactory extends Factory
{
    protected $model = Vehiculo::class;

    public function definition(): array
    {
        return [
            'placa' => strtoupper(fake()->bothify('???-####')),
            'marca' => fake()->randomElement(['Toyota', 'Mazda', 'Renault', 'Chevrolet', 'Audi', 'Mercedes', 'Nissan', 'BMW']),
            'modelo' => fake()->randomElement(['Corolla', 'Focus', 'Civic', 'X5', 'March', 'Spark', 'Hilux', 'C300']),
            'color' => fake()->randomElement(['Blanco', 'Negro', 'Gris', 'Rojo', 'Azul', 'Verde']),
            'tipo_vehiculo' => fake()->randomElement(['Automóvil', 'Motocicleta', 'Camioneta']),
            'propietario' => fake()->name(),
            'telefono_propietario' => fake()->numerify('3#########'),
            'estado' => fake()->randomElement(['activo', 'inactivo']),
            'observacion' => fake()->optional()->sentence(),
        ];
    }
}
