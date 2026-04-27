<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Registration extends Model
{
    use SoftDeletes;

    protected $table = 'registrations';

    public $timestamps = false; // table uses 'registered_at' instead of created_at/updated_at

    protected $fillable = [
        'user_id',
        'session_id',
        'registered_at',
        'status',
        'is_eligible',
        'rejection_reason',
        'confirmed_at',
        'withdrawn_at',
        'withdrawal_reason',
        'reference_number',
    ];

    protected $casts = [
        'is_eligible' => 'boolean',
        'registered_at' => 'datetime',
        'confirmed_at' => 'datetime',
        'withdrawn_at' => 'datetime',
        'deleted_at' => 'datetime',
    ];
}
