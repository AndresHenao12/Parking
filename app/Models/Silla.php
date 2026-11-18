<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Silla extends Model
{
    protected $table = 'sillas';

    protected $fillable = [
        'sala_id',
        'fila',
        'numero',
        'estado',
        'codigo',
    ];

    public function sala(): BelongsTo
    {
        return $this->belongsTo(Sala::class, 'sala_id');
    }

    public function boletas(): HasMany
    {
        return $this->hasMany(Boleta::class, 'silla_id');
    }
}
