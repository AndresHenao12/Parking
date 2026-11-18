<?php

use App\Models\Ciudades;
use App\Models\Departamentos;
use App\Models\Sucursales;
use App\Models\Trabajadores;
use Inertia\Testing\AssertableInertia as Assert;

test('departamentos can be managed from their page', function () {
    $this->post(route('departamentos.store'), [
        'nombre' => 'Antioquia',
        'descripcion' => 'Departamento de prueba',
    ])->assertRedirect(route('departamentos.index'));

    $departamento = Departamentos::query()->firstOrFail();

    $this->get(route('departamentos.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Departamentos/Index')
            ->where('records.0.nombre', 'Antioquia')
            ->where('records.0.ciudades', '0'),
        );

    $this->put(route('departamentos.update', $departamento), [
        'nombre' => 'Cundinamarca',
        'descripcion' => '',
    ])->assertRedirect(route('departamentos.index'));

    $this->assertDatabaseHas('departamentos', [
        'id' => $departamento->id,
        'nombre' => 'Cundinamarca',
        'descripcion' => null,
    ]);

    $this->delete(route('departamentos.destroy', $departamento))
        ->assertRedirect(route('departamentos.index'));

    $this->assertDatabaseMissing('departamentos', ['id' => $departamento->id]);
});

test('ciudades can be managed and display their departamento', function () {
    $departamento = Departamentos::factory()->create(['nombre' => 'Antioquia']);

    $this->post(route('ciudades.store'), [
        'departamento_id' => $departamento->id,
        'nombre' => 'Medellín',
        'descripcion' => '',
    ])->assertRedirect(route('ciudades.index'));

    $ciudad = Ciudades::query()->firstOrFail();

    $this->get(route('ciudades.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Ciudades/Index')
            ->where('records.0.departamento', 'Antioquia')
            ->where('records.0.nombre', 'Medellín')
            ->has('departamentos', 1),
        );

    $this->put(route('ciudades.update', $ciudad), [
        'departamento_id' => $departamento->id,
        'nombre' => 'Envigado',
        'descripcion' => '',
    ])->assertRedirect(route('ciudades.index'));

    $this->assertDatabaseHas('ciudades', [
        'id' => $ciudad->id,
        'nombre' => 'Envigado',
    ]);

    $this->delete(route('ciudades.destroy', $ciudad))
        ->assertRedirect(route('ciudades.index'));

    $this->assertDatabaseMissing('ciudades', ['id' => $ciudad->id]);
});

test('sucursales can be managed and display their city and department', function () {
    $ciudad = Ciudades::factory()->create(['nombre' => 'Medellín']);

    $this->post(route('sucursales.store'), [
        'ciudad_id' => $ciudad->id,
        'nombre' => 'Centro',
        'direccion' => 'Calle 10',
        'descripcion' => '',
    ])->assertRedirect(route('sucursales.index'));

    $sucursal = Sucursales::query()->firstOrFail();

    $this->get(route('sucursales.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Sucursales/Index')
            ->where('records.0.ciudad', 'Medellín')
            ->where('records.0.nombre', 'Centro')
            ->has('ciudades', 1),
        );

    $this->put(route('sucursales.update', $sucursal), [
        'ciudad_id' => $ciudad->id,
        'nombre' => 'Norte',
        'direccion' => 'Avenida 20',
        'descripcion' => '',
    ])->assertRedirect(route('sucursales.index'));

    $this->assertDatabaseHas('sucursales', [
        'id' => $sucursal->id,
        'nombre' => 'Norte',
        'direccion' => 'Avenida 20',
    ]);

    $this->delete(route('sucursales.destroy', $sucursal))
        ->assertRedirect(route('sucursales.index'));

    $this->assertDatabaseMissing('sucursales', ['id' => $sucursal->id]);
});

test('trabajadores can be managed and display their branch location', function () {
    $sucursal = Sucursales::factory()->create(['nombre' => 'Centro']);

    $this->post(route('trabajadores.store'), [
        'sucursal_id' => $sucursal->id,
        'nombres' => 'Ana',
        'apellidos' => 'Pérez',
        'telefono' => '',
        'direccion' => '',
    ])->assertRedirect(route('trabajadores.index'));

    $trabajador = Trabajadores::query()->firstOrFail();

    $this->get(route('trabajadores.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Trabajadores/Index')
            ->where('records.0.sucursal', 'Centro')
            ->where('records.0.nombres', 'Ana')
            ->where('records.0.departamento', $sucursal->ciudad->departamento->nombre)
            ->has('sucursales', 1),
        );

    $this->put(route('trabajadores.update', $trabajador), [
        'sucursal_id' => $sucursal->id,
        'nombres' => 'Ana María',
        'apellidos' => 'Pérez',
        'telefono' => '5551234567',
        'direccion' => 'Carrera 1',
    ])->assertRedirect(route('trabajadores.index'));

    $this->assertDatabaseHas('trabajadores', [
        'id' => $trabajador->id,
        'nombres' => 'Ana María',
        'telefono' => '5551234567',
    ]);

    $this->delete(route('trabajadores.destroy', $trabajador))
        ->assertRedirect(route('trabajadores.index'));

    $this->assertDatabaseMissing('trabajadores', ['id' => $trabajador->id]);
});
