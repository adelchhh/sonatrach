<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Announcement extends Model
{
    protected $fillable = [
        'created_by',
        'title',
        'content',
        'document_name',
        'document_path',
        'status',
        'publish_date',
    ];
}