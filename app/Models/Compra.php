<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Compra extends Model
{
    protected $table = 'compras';

    protected $fillable = [
        'codigo_compra',
        'user_id',
        'subtotal',
        'total',
        'moneda',
        'estado',
        'fecha_compra',
    ];

    protected $casts = [
        'subtotal' => 'decimal:2',
        'total' => 'decimal:2',
        'fecha_compra' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function boletas(): HasMany
    {
        return $this->hasMany(Boleta::class, 'compra_id');
    }

    public function pagos(): HasMany
    {
        return $this->hasMany(Pago::class, 'compra_id');
    }
}
