<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Document extends Model
{
    protected $table = 'documents';
    protected $primaryKey = 'document_id';

    public $timestamps = false; // table uses 'uploaded_at' / 'validated_at'

    protected $fillable = [
        'registration_id',
        'required_document_id',
        'file_name',
        'file_path',
        'document_type',
        'uploaded_at',
        'status',
        'validation_comment',
        'validated_by',
        'validated_at',
    ];

    protected $casts = [
        'uploaded_at' => 'datetime',
        'validated_at' => 'datetime',
    ];
}
