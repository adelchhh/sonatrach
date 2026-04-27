<?php

namespace App\Models;

use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable;

    protected $table = 'users';

    /**
     * The schema uses `account_created_at` instead of standard `created_at` / `updated_at`,
     * so we disable Eloquent's automatic timestamping.
     */
    public $timestamps = false;

    protected $fillable = [
        'name',
        'first_name',
        'email',
        'employee_number',
        'social_security_number',
        'password',
        'address',
        'active',
        'hire_date',
    ];

    protected $hidden = [
        'password',
    ];

    protected function casts(): array
    {
        return [
            'active' => 'boolean',
            'hire_date' => 'date',
            'account_created_at' => 'datetime',
        ];
    }
}
