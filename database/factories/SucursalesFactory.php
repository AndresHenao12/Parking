<?php

namespace Database\Factories;

use App\Models\Ciudades;
use App\Models\Sucursales;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Sucursales>
 */
class SucursalesFactory extends Factory
{
    protected $model = Sucursales::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'ciudad_id' => Ciudades::factory(),
            'nombre' => 'Sucursal '.fake()->unique()->numberBetween(1, 100000),
            'direccion' => fake()->address(),
            'descripcion' => fake()->optional()->sentence(),
        ];
    }
}
