<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Vehiculo extends Model
{
    use HasFactory;

    protected $table = 'vehiculos';

    protected $fillable = [
        'placa',
        'marca',
        'modelo',
        'color',
        'tipo_vehiculo',
        'propietario',
        'telefono_propietario',
        'estado',
        'observacion',
    ];

    public function registros(): HasMany
    {
        return $this->hasMany(RegistroEstacionamiento::class, 'vehiculo_id');
    }

    public function mensualidades(): HasMany
    {
        return $this->hasMany(Mensualidad::class, 'vehiculo_id');
    }
}
