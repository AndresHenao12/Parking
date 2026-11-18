<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Producto extends Model
{
    use HasFactory;

    protected $table = 'productos';

    protected $fillable = [
        'categoria_producto_id',
        'nombre',
        'descripcion',
        'precio_venta',
        'costo_compra',
        'cantidad_disponible',
        'stock_minimo',
        'activo',
        'imagen',
    ];

    protected $casts = [
        'precio_venta' => 'decimal:2',
        'costo_compra' => 'decimal:2',
        'cantidad_disponible' => 'integer',
        'stock_minimo' => 'integer',
        'activo' => 'boolean',
    ];

    protected $appends = [
        'es_stock_bajo',
    ];

    public function categoria(): BelongsTo
    {
        return $this->belongsTo(CategoriaProducto::class, 'categoria_producto_id');
    }

    public function detallesVenta(): HasMany
    {
        return $this->hasMany(DetalleVentaProducto::class, 'producto_id');
    }

    public function movimientos(): HasMany
    {
        return $this->hasMany(MovimientoInventario::class, 'producto_id');
    }

    protected function esStockBajo(): Attribute
    {
        return Attribute::make(
            get: fn (): bool => $this->cantidad_disponible <= $this->stock_minimo
        );
    }

    public function scopeActivos(Builder $query): Builder
    {
        return $query->where('activo', true);
    }
}
