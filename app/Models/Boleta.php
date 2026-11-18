<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Boleta extends Model
{
    protected $table = 'boletas';

    protected $fillable = [
        'compra_id',
        'funcion_id',
        'silla_id',
        'codigo_boleta',
        'precio',
        'estado',
    ];

    protected $casts = [
        'precio' => 'decimal:2',
    ];

    public function compra(): BelongsTo
    {
        return $this->belongsTo(Compra::class, 'compra_id');
    }

    public function funcion(): BelongsTo
    {
        return $this->belongsTo(Funcion::class, 'funcion_id');
    }

    public function silla(): BelongsTo
    {
        return $this->belongsTo(Silla::class, 'silla_id');
    }
}
