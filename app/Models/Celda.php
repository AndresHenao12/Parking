<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Celda extends Model
{
    use HasFactory;

    protected $table = 'celdas';

    protected $fillable = [
        'codigo',
        'tipo_vehiculo',
        'estado',
        'capacidad',
        'descripcion',
    ];

    public function registros(): HasMany
    {
        return $this->hasMany(RegistroEstacionamiento::class, 'celda_id');
    }
}
