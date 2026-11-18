<?php

namespace Database\Factories;

use App\Models\Pelicula;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Pelicula>
 */
class PeliculaFactory extends Factory
{
    protected $model = Pelicula::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $slug = fake()->unique()->slug(3);

        return [
            'titulo' => Str::title(str_replace('-', ' ', $slug)),
            'slug' => $slug,
            'sinopsis' => fake()->paragraphs(3, true),
            'imagen' => null,
            'duracion_minutos' => fake()->numberBetween(80, 180),
            'genero' => fake()->randomElement(Pelicula::GENEROS),
            'clasificacion' => fake()->randomElement(array_keys(Pelicula::CLASIFICACIONES)),
            'director' => fake()->name(),
            'anio' => fake()->numberBetween(1990, 2026),
            'fecha_estreno' => fake()->dateTimeBetween('-10 years', 'now')->format('Y-m-d'),
            'estado' => fake()->boolean(80),
        ];
    }
}
