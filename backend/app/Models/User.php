<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'username',
        'email',
        'password',
        'headline',
        'bio',
        'avatar_url',
        'location',
        'is_active',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'is_active' => 'boolean',
        ];
    }

    /** Goods this user has advertised on the feed. */
    public function listings(): HasMany
    {
        return $this->hasMany(Listing::class);
    }

    /** Connection rows this user initiated. */
    public function sentConnections(): HasMany
    {
        return $this->hasMany(Connection::class, 'requester_id');
    }

    /** Connection rows pointed at this user. */
    public function receivedConnections(): HasMany
    {
        return $this->hasMany(Connection::class, 'addressee_id');
    }

    /** IDs of users this user is connected to (accepted, either direction). */
    public function connectedUserIds(): array
    {
        $sent = $this->sentConnections()
            ->where('status', Connection::STATUS_ACCEPTED)
            ->pluck('addressee_id');

        $received = $this->receivedConnections()
            ->where('status', Connection::STATUS_ACCEPTED)
            ->pluck('requester_id');

        return $sent->merge($received)->unique()->values()->all();
    }
}
