<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Mensualidad extends Model
{
    use HasFactory;

    protected $table = 'mensualidades';

    protected $fillable = [
        'vehiculo_id',
        'tarifa_id',
        'valor',
        'fecha_inicio',
        'fecha_vencimiento',
        'estado',
    ];

    public function vehiculo(): BelongsTo
    {
        return $this->belongsTo(Vehiculo::class, 'vehiculo_id');
    }

    public function tarifa(): BelongsTo
    {
        return $this->belongsTo(Tarifa::class, 'tarifa_id');
    }
}
