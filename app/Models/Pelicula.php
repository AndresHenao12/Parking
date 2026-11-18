<?php

namespace App\Models;

use Database\Factories\PeliculaFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Pelicula extends Model
{
    /** @use HasFactory<PeliculaFactory> */
     public function funciones()
    {
        return $this->hasMany(Funcion::class, 'pelicula_id');
    }
    use HasFactory;

    public const array GENEROS = [
        'Acción',
        'Aventura',
        'Ciencia ficción',
        'Comedia',
        'Drama',
        'Fantasía',
        'Terror',
        'Suspenso',
    ];

    public const array CLASIFICACIONES = [
        'ATP' => 'Apta para todo público',
        '13' => 'Mayores de 13 años',
        '16' => 'Mayores de 16 años',
        '18' => 'Mayores de 18 años',
    ];

    protected $table = 'peliculas';

    protected $fillable = [
        'titulo',
        'slug',
        'sinopsis',
        'imagen',
        'duracion_minutos',
        'genero',
        'clasificacion',
        'director',
        'anio',
        'fecha_estreno',
        'estado',
    ];
}
