<?php

namespace Database\Factories;

use App\Models\Ciudades;
use App\Models\Departamentos;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Ciudades>
 */
class CiudadesFactory extends Factory
{
    protected $model = Ciudades::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'departamento_id' => Departamentos::factory(),
            'nombre' => fake()->city(),
            'descripcion' => fake()->optional()->sentence(),
        ];
    }
}
