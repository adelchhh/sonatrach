<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SessionSite extends Model
{
    protected $table = 'session_sites';

    public $timestamps = true;

    protected $fillable = [
        'session_id',
        'site_id',
        'quota',
    ];

    protected $casts = [
        'quota' => 'integer',
    ];
}
