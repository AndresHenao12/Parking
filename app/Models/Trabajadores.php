<?php

namespace App\Models;

use Database\Factories\TrabajadoresFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $id
 * @property int $sucursal_id
 * @property string $nombres
 * @property string $apellidos
 * @property string|null $telefono
 * @property string|null $direccion
 * @property-read Sucursales $sucursal
 */
class Trabajadores extends Model
{
    /** @use HasFactory<TrabajadoresFactory> */
    use HasFactory;

    protected $table = 'trabajadores';

    public $timestamps = false;

    protected $fillable = ['sucursal_id', 'nombres', 'apellidos', 'telefono', 'direccion'];

    /** @return BelongsTo<Sucursales, $this> */
    public function sucursal(): BelongsTo
    {
        return $this->belongsTo(Sucursales::class, 'sucursal_id');
    }
}
