<?php

use App\Models\Pelicula;
use App\Models\Sucursales;
use Inertia\Testing\AssertableInertia as Assert;

test('peliculas index renders the full title-sorted catalogue', function () {
    foreach (range(11, 1) as $number) {
        Pelicula::factory()->create([
            'titulo' => sprintf('Película %02d', $number),
        ]);
    }

    $this->get(route('peliculas.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Pelicula/Index')
            ->has('peliculas', 11)
            ->where('peliculas.0.titulo', 'Película 01')
            ->where('peliculas.10.titulo', 'Película 11'),
        );
});

test('peliculas index includes departments, cities, and branches for location browsing', function () {
    $sucursal = Sucursales::factory()->create([
        'nombre' => 'Sucursal Centro',
        'direccion' => 'Calle 10',
    ]);

    $this->get(route('peliculas.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Pelicula/Index')
            ->where('ubicaciones.0.id', $sucursal->ciudad->departamento->id)
            ->where('ubicaciones.0.nombre', $sucursal->ciudad->departamento->nombre)
            ->where('ubicaciones.0.ciudades.0.id', $sucursal->ciudad->id)
            ->where('ubicaciones.0.ciudades.0.sucursales.0.nombre', 'Sucursal Centro')
            ->where('ubicaciones.0.ciudades.0.sucursales.0.direccion', 'Calle 10'),
        );
});

test('a new pelicula can be created from the catalogue', function () {
    Pelicula::factory()->create([
        'titulo' => 'Noche de estreno',
        'slug' => 'noche-de-estreno',
    ]);

    $this->post(route('peliculas.store'), [
        'titulo' => 'Noche de estreno',
        'director' => 'Ana Pérez',
        'anio' => '2025',
        'duracion_minutos' => '108',
        'clasificacion' => '13',
        'genero' => 'Drama',
        'sinopsis' => 'Una historia sobre el cine.',
        'imagen' => '',
    ])->assertRedirect(route('peliculas.index'));

    $this->assertDatabaseHas('peliculas', [
        'titulo' => 'Noche de estreno',
        'slug' => 'noche-de-estreno-2',
        'director' => 'Ana Pérez',
        'anio' => 2025,
        'duracion_minutos' => 108,
        'imagen' => null,
    ]);
});

test('a pelicula can be edited without duplicating its slug', function () {
    $pelicula = Pelicula::factory()->create([
        'titulo' => 'Noche de estreno',
        'slug' => 'noche-de-estreno',
    ]);

    $this->put(route('peliculas.update', $pelicula), [
        'titulo' => 'Noche de estreno',
        'director' => 'Ana Pérez',
        'anio' => '',
        'duracion_minutos' => '110',
        'clasificacion' => 'ATP',
        'genero' => 'Drama',
        'sinopsis' => 'Una sinopsis actualizada.',
        'imagen' => '',
    ])->assertRedirect(route('peliculas.index'));

    $this->assertDatabaseHas('peliculas', [
        'id' => $pelicula->id,
        'slug' => 'noche-de-estreno',
        'director' => 'Ana Pérez',
        'anio' => null,
        'duracion_minutos' => 110,
        'sinopsis' => 'Una sinopsis actualizada.',
    ]);
});

test('a pelicula can be deleted from the catalogue', function () {
    $pelicula = Pelicula::factory()->create();

    $this->delete(route('peliculas.destroy', $pelicula))
        ->assertRedirect(route('peliculas.index'));

    $this->assertDatabaseMissing('peliculas', [
        'id' => $pelicula->id,
    ]);
});
