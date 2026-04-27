<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Draw extends Model
{
    protected $table = 'draws';
    protected $primaryKey = 'draw_id';

    public $timestamps = false; // table has draw_date / executed_at

    protected $fillable = [
        'session_id',
        'admin_id',
        'draw_date',
        'draw_location',
        'mode',
        'executed',
        'executed_at',
    ];

    protected $casts = [
        'draw_date' => 'datetime',
        'executed_at' => 'datetime',
        'executed' => 'boolean',
    ];
}
