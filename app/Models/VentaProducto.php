<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class VentaProducto extends Model
{
    use HasFactory;

    protected $table = 'ventas_productos';

    protected $fillable = [
        'numero_venta',
        'user_id',
        'trabajador_id',
        'subtotal',
        'total',
        'cantidad_productos',
        'estado',
        'fecha_venta',
    ];

    protected $casts = [
        'subtotal' => 'decimal:2',
        'total' => 'decimal:2',
        'cantidad_productos' => 'integer',
        'fecha_venta' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function trabajador(): BelongsTo
    {
        return $this->belongsTo(Trabajadores::class, 'trabajador_id');
    }

    public function detalles(): HasMany
    {
        return $this->hasMany(DetalleVentaProducto::class, 'venta_producto_id');
    }

    public function movimientos(): HasMany
    {
        return $this->hasMany(MovimientoInventario::class, 'venta_producto_id');
    }
}
