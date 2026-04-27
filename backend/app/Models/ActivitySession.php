<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ActivitySession extends Model
{
    protected $table = 'activity_sessions';

    public $timestamps = true;

    protected $fillable = [
        'activity_id',
        'start_date',
        'end_date',
        'registration_deadline',
        'draw_date',
        'draw_location',
        'confirmation_delay_hours',
        'document_upload_deadline',
        'transport_included',
        'telefax_url',
        'substitutes_count',
        'status',
    ];

    protected $casts = [
        'start_date' => 'date:Y-m-d',
        'end_date' => 'date:Y-m-d',
        'registration_deadline' => 'date:Y-m-d',
        'draw_date' => 'date:Y-m-d',
        'document_upload_deadline' => 'date:Y-m-d',
        'transport_included' => 'boolean',
        'confirmation_delay_hours' => 'integer',
        'substitutes_count' => 'integer',
    ];

    public function activity()
    {
        return $this->belongsTo(Activite::class, 'activity_id');
    }
}
