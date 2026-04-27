<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class WithdrawalRequest extends Model
{
    protected $table = 'withdrawal_requests';

    public $timestamps = false; // table uses 'requested_at' / 'processed_at'

    protected $fillable = [
        'registration_id',
        'requested_at',
        'reason',
        'status',
        'processed_by',
        'processed_at',
        'admin_comment',
    ];

    protected $casts = [
        'requested_at' => 'datetime',
        'processed_at' => 'datetime',
    ];
}
