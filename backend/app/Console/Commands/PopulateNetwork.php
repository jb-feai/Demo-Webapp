<?php

namespace App\Console\Commands;

use App\Models\Connection;
use App\Models\Listing;
use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Collection;

/**
 * Supplementally grows the dummy social network. Unlike DatabaseSeeder this is
 * purely *additive*: it never truncates, so you can run it repeatedly to keep
 * piling on more users, listings, and connections.
 *
 *   php artisan network:populate
 *   php artisan network:populate --users=50 --listings=200 --connections=120
 *   php artisan network:populate --listings=30 --users=0 --connections=0
 */
class PopulateNetwork extends Command
{
    protected $signature = 'network:populate
        {--users=20 : Number of new users to create}
        {--listings=60 : Number of new listings to create (spread across all users)}
        {--connections=40 : Number of new connections to attempt between users}
        {--force : Allow running in the production environment}';

    protected $description = 'Supplementally populate the network with extra users, listings, and connections (additive — does not wipe existing data).';

    public function handle(): int
    {
        if ($this->getLaravel()->environment('production') && ! $this->option('force')) {
            $this->error('Refusing to run in production without --force.');

            return self::FAILURE;
        }

        $userCount = max(0, (int) $this->option('users'));
        $listingCount = max(0, (int) $this->option('listings'));
        $connectionCount = max(0, (int) $this->option('connections'));

        $this->newUsers($userCount);
        $this->newListings($listingCount);
        $made = $this->newConnections($connectionCount);

        $this->newLine();
        $this->info(sprintf(
            'Done. Totals now — users: %d, listings: %d, connections: %d.',
            User::count(),
            Listing::count(),
            Connection::count(),
        ));
        $this->line(sprintf(
            'Added this run — users: %d, listings: %d, connections: %d.',
            $userCount,
            $listingCount,
            $made,
        ));

        return self::SUCCESS;
    }

    private function newUsers(int $count): void
    {
        if ($count === 0) {
            return;
        }

        User::factory($count)->create();
        $this->info("Created {$count} users.");
    }

    /**
     * Listings are spread across *all* users (existing + newly created) so the
     * feed stays representative rather than belonging only to brand-new accounts.
     */
    private function newListings(int $count): void
    {
        if ($count === 0) {
            return;
        }

        $owners = User::all();
        if ($owners->isEmpty()) {
            $this->warn('No users exist to own listings — skipping listings.');

            return;
        }

        Listing::factory($count)->recycle($owners)->create();
        $this->info("Created {$count} listings.");
    }

    /**
     * Attempts to create up to $count connections between distinct users while
     * keeping the data coherent: no self-connections, and no duplicate pair in
     * either direction. Returns how many were actually created.
     */
    private function newConnections(int $count): int
    {
        if ($count === 0) {
            return 0;
        }

        $userIds = User::pluck('id')->all();
        if (count($userIds) < 2) {
            $this->warn('Need at least 2 users to create connections — skipping.');

            return 0;
        }

        // Track existing pairs (order-independent) so we never duplicate one.
        $existing = $this->existingPairKeys();

        $statuses = [
            Connection::STATUS_PENDING,
            Connection::STATUS_ACCEPTED,
            Connection::STATUS_DECLINED,
        ];

        $made = 0;
        $maxAttempts = $count * 10; // bound the loop on dense graphs
        $attempts = 0;

        while ($made < $count && $attempts < $maxAttempts) {
            $attempts++;

            $a = $userIds[array_rand($userIds)];
            $b = $userIds[array_rand($userIds)];
            if ($a === $b) {
                continue;
            }

            $key = $this->pairKey($a, $b);
            if ($existing->has($key)) {
                continue;
            }

            Connection::create([
                'requester_id' => $a,
                'addressee_id' => $b,
                'status' => $statuses[array_rand($statuses)],
            ]);

            $existing->put($key, true);
            $made++;
        }

        if ($made < $count) {
            $this->warn("Only created {$made}/{$count} connections (ran out of unique pairs).");
        } else {
            $this->info("Created {$made} connections.");
        }

        return $made;
    }

    private function existingPairKeys(): Collection
    {
        return Connection::query()
            ->get(['requester_id', 'addressee_id'])
            ->mapWithKeys(fn (Connection $c) => [
                $this->pairKey($c->requester_id, $c->addressee_id) => true,
            ]);
    }

    /** Order-independent key so (a,b) and (b,a) collide. */
    private function pairKey(int $a, int $b): string
    {
        return $a < $b ? "{$a}:{$b}" : "{$b}:{$a}";
    }
}
