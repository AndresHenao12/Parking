<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Tarifa extends Model
{
    use HasFactory;

    protected $table = 'tarifas';

    protected $fillable = [
        'nombre',
        'tipo_vehiculo',
        'precio_hora',
        'precio_diario',
        'activo',
    ];

    public function registros(): HasMany
    {
        return $this->hasMany(RegistroEstacionamiento::class, 'tarifa_id');
    }

    public function mensualidades(): HasMany
    {
        return $this->hasMany(Mensualidad::class, 'tarifa_id');
    }
}
