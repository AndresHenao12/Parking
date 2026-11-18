<?php

namespace App\Models;

use Database\Factories\CiudadesFactory;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * @property int $id
 * @property int $departamento_id
 * @property string $nombre
 * @property string|null $descripcion
 * @property-read Departamentos $departamento
 * @property-read Collection<int, Sucursales> $sucursales
 */
class Ciudades extends Model
{
    /** @use HasFactory<CiudadesFactory> */
    use HasFactory;

    protected $table = 'ciudades';

    public $timestamps = false;

    protected $fillable = ['departamento_id', 'nombre', 'descripcion'];

    /** @return BelongsTo<Departamentos, $this> */
    public function departamento(): BelongsTo
    {
        return $this->belongsTo(Departamentos::class, 'departamento_id');
    }

    /** @return HasMany<Sucursales, $this> */
    public function sucursales(): HasMany
    {
        return $this->hasMany(Sucursales::class, 'ciudad_id');
    }
}
