<?php

namespace App\Http\Controllers;

use App\Models\Connection;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ExploreController extends Controller
{
    /**
     * GET /api/explore  ->  Social Explore: people you can connect with.
     *
     * Returns active users (excluding yourself) annotated with the
     * connection status between you and them.
     */
    public function index(Request $request): JsonResponse
    {
        $me = $request->user();

        $people = User::query()
            ->where('id', '!=', $me->id)
            ->where('is_active', true)
            ->when($request->filled('q'), function ($q) use ($request) {
                $term = '%'.$request->string('q').'%';
                $q->where(fn ($sub) => $sub->where('name', 'ilike', $term)
                    ->orWhere('username', 'ilike', $term)
                    ->orWhere('headline', 'ilike', $term));
            })
            ->select('id', 'name', 'username', 'headline', 'avatar_url', 'location')
            ->paginate(18);

        // Map of other_user_id => connection status for annotation.
        $statuses = Connection::query()
            ->where('requester_id', $me->id)
            ->orWhere('addressee_id', $me->id)
            ->get()
            ->mapWithKeys(function (Connection $c) use ($me) {
                $otherId = $c->requester_id === $me->id ? $c->addressee_id : $c->requester_id;
                $direction = $c->requester_id === $me->id ? 'outgoing' : 'incoming';

                return [$otherId => ['status' => $c->status, 'direction' => $direction, 'id' => $c->id]];
            });

        $people->getCollection()->transform(function (User $u) use ($statuses) {
            $u->connection = $statuses->get($u->id);

            return $u;
        });

        return response()->json($people);
    }

    /**
     * POST /api/explore/{user}/connect  ->  Send a connection request.
     */
    public function connect(Request $request, User $user): JsonResponse
    {
        $me = $request->user();

        if ($user->id === $me->id) {
            return response()->json(['message' => 'You cannot connect with yourself.'], 422);
        }

        $connection = Connection::firstOrCreate(
            ['requester_id' => $me->id, 'addressee_id' => $user->id],
            ['status' => Connection::STATUS_PENDING],
        );

        return response()->json($connection, $connection->wasRecentlyCreated ? 201 : 200);
    }

    /**
     * POST /api/explore/connections/{connection}/respond  ->  Accept / decline a request.
     */
    public function respond(Request $request, Connection $connection): JsonResponse
    {
        $me = $request->user();

        // Only the addressee may respond.
        abort_unless($connection->addressee_id === $me->id, 403);

        $data = $request->validate([
            'action' => ['required', 'in:accept,decline'],
        ]);

        $connection->update([
            'status' => $data['action'] === 'accept'
                ? Connection::STATUS_ACCEPTED
                : Connection::STATUS_DECLINED,
        ]);

        return response()->json($connection);
    }

    /**
     * GET /api/explore/requests  ->  Pending requests addressed to me.
     */
    public function requests(Request $request): JsonResponse
    {
        $pending = $request->user()
            ->receivedConnections()
            ->where('status', Connection::STATUS_PENDING)
            ->with('requester:id,name,username,avatar_url,headline')
            ->latest()
            ->get();

        return response()->json($pending);
    }
}
