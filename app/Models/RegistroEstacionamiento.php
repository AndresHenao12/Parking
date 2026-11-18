<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RegistroEstacionamiento extends Model
{
    use HasFactory;

    protected $table = 'registros_estacionamiento';

    protected $fillable = [
        'vehiculo_id',
        'celda_id',
        'tarifa_id',
        'hora_entrada',
        'hora_salida',
        'tiempo_minutos',
        'valor_total',
        'estado',
    ];

    public function vehiculo(): BelongsTo
    {
        return $this->belongsTo(Vehiculo::class, 'vehiculo_id');
    }

    public function celda(): BelongsTo
    {
        return $this->belongsTo(Celda::class, 'celda_id');
    }

    public function tarifa(): BelongsTo
    {
        return $this->belongsTo(Tarifa::class, 'tarifa_id');
    }
}
