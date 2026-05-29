<?php

namespace Database\Seeders;

use App\Models\Connection;
use App\Models\Listing;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // A known demo account you can log in with.
        $demo = User::factory()->create([
            'name' => 'Demo User',
            'username' => 'demo',
            'email' => 'demo@neonmarket.test',
            'password' => Hash::make('password'),
            'headline' => 'Founder @ NeonMarket',
        ]);

        // A pool of other people to connect with and browse.
        $others = User::factory(15)->create();

        // Listings for everyone (the advertised goods that fill the feed).
        Listing::factory(40)
            ->recycle($others->push($demo))
            ->create();

        // Seed a few accepted connections for the demo user.
        foreach ($others->take(5) as $friend) {
            Connection::create([
                'requester_id' => $demo->id,
                'addressee_id' => $friend->id,
                'status' => Connection::STATUS_ACCEPTED,
            ]);
        }

        // And a couple of pending requests addressed to the demo user.
        foreach ($others->slice(5, 3) as $pending) {
            Connection::create([
                'requester_id' => $pending->id,
                'addressee_id' => $demo->id,
                'status' => Connection::STATUS_PENDING,
            ]);
        }
    }
}
