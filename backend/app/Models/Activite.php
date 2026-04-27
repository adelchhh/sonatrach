<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Activite extends Model
{
    use SoftDeletes;

    protected $table = 'activities';

    public $timestamps = true;

    protected $fillable = [
        'title',
        'description',
        'category',
        'minimum_seniority',
        'draw_enabled',
        'demand_level',
        'status',
        'image_url',
    ];

    protected $casts = [
        'draw_enabled' => 'boolean',
        'minimum_seniority' => 'integer',
    ];

    public const CATEGORIES = ['SPORT', 'FAMILY', 'STAY', 'NATURE', 'SPIRITUAL', 'TRAVEL', 'LEISURE'];
    public const DEMAND_LEVELS = ['HIGH', 'MEDIUM', 'LOW'];
    public const STATUSES = ['DRAFT', 'PUBLISHED', 'ARCHIVED', 'CANCELLED'];
}
