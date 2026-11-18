<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Funcion extends Model
{
    protected $table = 'funciones';

    protected $fillable = [
        'pelicula_id',
        'sala_id',
        'fecha',
        'hora_inicio',
        'hora_fin',
        'precio',
        'estado',
    ];

    public function pelicula()
    {
        return $this->belongsTo(Pelicula::class, 'pelicula_id');
    }

    public function sala()
    {
        return $this->belongsTo(Sala::class, 'sala_id');
    }

    public function boletas()
    {
        return $this->hasMany(Boleta::class, 'funcion_id');
    }
}

