<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class UserFactory extends Factory
{
    protected static ?string $password = null;

    public function definition(): array
    {
        return [
            'name' => fake()->name(),
            'username' => fake()->unique()->userName(),
            'email' => fake()->unique()->safeEmail(),
            'email_verified_at' => now(),
            'password' => static::$password ??= Hash::make('password'),
            'headline' => fake()->catchPhrase(),
            'bio' => fake()->sentence(12),
            'avatar_url' => 'https://i.pravatar.cc/300?u='.Str::uuid(),
            'location' => fake()->city().', '.fake()->stateAbbr(),
            'is_active' => true,
            'remember_token' => Str::random(10),
        ];
    }
}
