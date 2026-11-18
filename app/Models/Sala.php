<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Sala extends Model
{
    protected $fillable = ['nombre', 'capacidad', 'estado'];

    public function funciones()
    {
        return $this->hasMany(Funcion::class, 'sala_id');
    }

    public function sillas()
    {
        return $this->hasMany(Silla::class, 'sala_id');
    }
}
