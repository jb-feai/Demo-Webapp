<?php

namespace Tests\Unit;

use App\Models\Connection;
use PHPUnit\Framework\TestCase;

class ConnectionStatusTest extends TestCase
{
    public function test_status_constants_are_distinct_and_lowercase(): void
    {
        $statuses = [
            Connection::STATUS_PENDING,
            Connection::STATUS_ACCEPTED,
            Connection::STATUS_DECLINED,
        ];

        // No accidental duplicates among the status values.
        $this->assertSame($statuses, array_values(array_unique($statuses)));

        // Stored values are the canonical lowercase strings the API/migration expect.
        $this->assertSame(['pending', 'accepted', 'declined'], $statuses);
    }
}
