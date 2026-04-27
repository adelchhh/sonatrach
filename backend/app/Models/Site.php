<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Site extends Model
{
    protected $table = 'sites';

    public $timestamps = true;

    protected $fillable = [
        'name',
        'address',
    ];
}
