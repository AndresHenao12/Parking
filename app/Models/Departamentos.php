<?php

namespace App\Models;

use Database\Factories\DepartamentosFactory;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * @property int $id
 * @property string $nombre
 * @property string|null $descripcion
 * @property-read int $ciudades_count
 * @property-read Collection<int, Ciudades> $ciudades
 */
class Departamentos extends Model
{
    /** @use HasFactory<DepartamentosFactory> */
    use HasFactory;

    protected $table = 'departamentos';

    public $timestamps = false;

    protected $fillable = ['nombre', 'descripcion'];

    /** @return HasMany<Ciudades, $this> */
    public function ciudades(): HasMany
    {
        return $this->hasMany(Ciudades::class, 'departamento_id');
    }
}
