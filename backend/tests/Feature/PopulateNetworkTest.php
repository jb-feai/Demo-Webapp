<?php

namespace Tests\Feature;

use App\Models\Connection;
use App\Models\Listing;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Verifies that `php artisan network:populate` inserts coherent data:
 * correct counts, additive behaviour, valid foreign keys, unique identities,
 * and well-formed connections.
 */
class PopulateNetworkTest extends TestCase
{
    use RefreshDatabase;

    public function test_it_creates_the_requested_number_of_users_and_listings(): void
    {
        $this->artisan('network:populate', [
            '--users' => 5,
            '--listings' => 12,
            '--connections' => 0,
        ])->assertSuccessful();

        $this->assertSame(5, User::count());
        $this->assertSame(12, Listing::count());
    }

    public function test_population_is_additive_and_does_not_wipe_existing_data(): void
    {
        // Pre-existing data (as if from a previous run / the seeder).
        $existing = User::factory(3)->create();
        Listing::factory(4)->recycle($existing)->create();

        $this->artisan('network:populate', [
            '--users' => 6,
            '--listings' => 10,
            '--connections' => 0,
        ])->assertSuccessful();

        // Counts grew; nothing was removed.
        $this->assertSame(9, User::count());
        $this->assertSame(14, Listing::count());
    }

    public function test_every_listing_belongs_to_a_real_user(): void
    {
        $this->artisan('network:populate', [
            '--users' => 8,
            '--listings' => 25,
            '--connections' => 0,
        ])->assertSuccessful();

        $orphanedListings = Listing::whereNotIn('user_id', User::pluck('id'))->count();

        $this->assertSame(0, $orphanedListings, 'Found listings with no valid owner.');
    }

    public function test_listing_money_fields_are_well_formed(): void
    {
        $this->artisan('network:populate', [
            '--users' => 5,
            '--listings' => 30,
            '--connections' => 0,
        ])->assertSuccessful();

        $this->assertSame(0, Listing::where('price_cents', '<', 0)->count(), 'Negative prices found.');
        $this->assertSame(0, Listing::whereRaw('length(currency) <> 3')->count(), 'Malformed currency codes found.');
    }

    public function test_usernames_and_emails_are_unique(): void
    {
        $this->artisan('network:populate', [
            '--users' => 40,
            '--listings' => 0,
            '--connections' => 0,
        ])->assertSuccessful();

        $total = User::count();
        $this->assertSame($total, User::pluck('email')->unique()->count(), 'Duplicate emails found.');
        $this->assertSame($total, User::pluck('username')->unique()->count(), 'Duplicate usernames found.');
    }

    public function test_connections_are_coherent(): void
    {
        $this->artisan('network:populate', [
            '--users' => 12,
            '--listings' => 0,
            '--connections' => 25,
        ])->assertSuccessful();

        $this->assertGreaterThan(0, Connection::count(), 'Expected some connections to be created.');

        // No one is connected to themselves.
        $this->assertSame(
            0,
            Connection::whereColumn('requester_id', 'addressee_id')->count(),
            'Self-connections found.',
        );

        // Both endpoints reference real users.
        $userIds = User::pluck('id');
        $this->assertSame(0, Connection::whereNotIn('requester_id', $userIds)->count(), 'Dangling requester_id.');
        $this->assertSame(0, Connection::whereNotIn('addressee_id', $userIds)->count(), 'Dangling addressee_id.');

        // Status is always one of the allowed values.
        $allowed = [
            Connection::STATUS_PENDING,
            Connection::STATUS_ACCEPTED,
            Connection::STATUS_DECLINED,
        ];
        $this->assertSame(0, Connection::whereNotIn('status', $allowed)->count(), 'Invalid connection status.');

        // No duplicate relationship in either direction.
        $pairs = Connection::all()->map(function (Connection $c) {
            return $c->requester_id < $c->addressee_id
                ? "{$c->requester_id}:{$c->addressee_id}"
                : "{$c->addressee_id}:{$c->requester_id}";
        });
        $this->assertSame($pairs->count(), $pairs->unique()->count(), 'Duplicate connection pairs found.');
    }

    public function test_zero_options_create_nothing(): void
    {
        $this->artisan('network:populate', [
            '--users' => 0,
            '--listings' => 0,
            '--connections' => 0,
        ])->assertSuccessful();

        $this->assertSame(0, User::count());
        $this->assertSame(0, Listing::count());
        $this->assertSame(0, Connection::count());
    }

    public function test_listings_are_spread_across_existing_users_not_just_new_ones(): void
    {
        $veteran = User::factory()->create();

        // Create only listings (no new users); they must attach to the veteran.
        $this->artisan('network:populate', [
            '--users' => 0,
            '--listings' => 5,
            '--connections' => 0,
        ])->assertSuccessful();

        $this->assertSame(5, $veteran->listings()->count());
    }
}
