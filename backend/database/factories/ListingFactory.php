<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class ListingFactory extends Factory
{
    public function definition(): array
    {
        $categories = ['Electronics', 'Fashion', 'Home', 'Sports', 'Art', 'Gaming'];

        return [
            'user_id' => User::factory(),
            'title' => ucfirst(fake()->words(3, true)),
            'description' => fake()->paragraph(),
            'price_cents' => fake()->numberBetween(500, 250000),
            'currency' => 'USD',
            'category' => fake()->randomElement($categories),
            'image_url' => 'https://picsum.photos/seed/'.fake()->uuid().'/600/400',
            'is_promoted' => fake()->boolean(35),
        ];
    }
}
