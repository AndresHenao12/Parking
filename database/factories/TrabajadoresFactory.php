<?php

namespace Database\Factories;

use App\Models\Sucursales;
use App\Models\Trabajadores;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Trabajadores>
 */
class TrabajadoresFactory extends Factory
{
    protected $model = Trabajadores::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'sucursal_id' => Sucursales::factory(),
            'nombres' => fake()->firstName(),
            'apellidos' => fake()->lastName(),
            'telefono' => fake()->optional()->numerify('##########'),
            'direccion' => fake()->optional()->address(),
        ];
    }
}
