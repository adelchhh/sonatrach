<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class OfficialNote extends Model
{
    protected $table = 'official_notes';
    protected $primaryKey = 'note_id';

    public $timestamps = true;

    protected $fillable = [
        'user_id',
        'title',
        'content',
        'type',
        'audience',
        'attachment_url',
        'status',
        'published_at',
    ];

    protected $casts = [
        'published_at' => 'datetime',
    ];
}
