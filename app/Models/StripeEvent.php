<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class StripeEvent extends Model
{
    protected $table = 'stripe_events';

    public $timestamps = false;

    protected $fillable = [
        'event_id',
        'event_type',
        'processed_at',
    ];
}
