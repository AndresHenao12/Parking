<?php

namespace Database\Factories;

use App\Models\Departamentos;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Departamentos>
 */
class DepartamentosFactory extends Factory
{
    protected $model = Departamentos::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'nombre' => fake()->unique()->jobTitle(),
            'descripcion' => fake()->optional()->sentence(),
        ];
    }
}
