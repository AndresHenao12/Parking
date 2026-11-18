<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Pago extends Model
{
    protected $table = 'pagos';

    protected $fillable = [
        'compra_id',
        'proveedor',
        'referencia_externa',
        'session_id',
        'payment_intent_id',
        'monto',
        'moneda',
        'estado',
        'metodo_pago',
        'respuesta_proveedor',
        'pagado_en',
    ];

    protected $casts = [
        'monto' => 'decimal:2',
        'respuesta_proveedor' => 'array',
        'pagado_en' => 'datetime',
    ];

    public function compra(): BelongsTo
    {
        return $this->belongsTo(Compra::class, 'compra_id');
    }
}
