<?php

namespace App\Models;

use Database\Factories\SucursalesFactory;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * @property int $id
 * @property int $ciudad_id
 * @property string $nombre
 * @property string $direccion
 * @property string|null $descripcion
 * @property-read Ciudades $ciudad
 * @property-read Collection<int, Trabajadores> $trabajadores
 */
class Sucursales extends Model
{
    /** @use HasFactory<SucursalesFactory> */
    use HasFactory;

    protected $table = 'sucursales';

    public $timestamps = false;

    protected $fillable = ['ciudad_id', 'nombre', 'direccion', 'descripcion'];

    /** @return BelongsTo<Ciudades, $this> */
    public function ciudad(): BelongsTo
    {
        return $this->belongsTo(Ciudades::class, 'ciudad_id');
    }

    /** @return HasMany<Trabajadores, $this> */
    public function trabajadores(): HasMany
    {
        return $this->hasMany(Trabajadores::class, 'sucursal_id');
    }
}
