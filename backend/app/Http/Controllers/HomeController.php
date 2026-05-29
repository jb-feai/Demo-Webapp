<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class HomeController extends Controller
{
    /**
     * GET /api/home  ->  Homepage: the signed-in user's profile + summary stats.
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        $connectionIds = $user->connectedUserIds();

        return response()->json([
            'user' => $user,
            'stats' => [
                'connections' => count($connectionIds),
                'listings' => $user->listings()->count(),
                'pending_requests' => $user->receivedConnections()
                    ->where('status', \App\Models\Connection::STATUS_PENDING)
                    ->count(),
            ],
            'recent_listings' => $user->listings()
                ->latest()
                ->take(6)
                ->get(),
        ]);
    }

    /**
     * PUT /api/home/profile  ->  Update the home-page profile fields.
     */
    public function update(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name' => ['sometimes', 'string', 'max:255'],
            'headline' => ['nullable', 'string', 'max:255'],
            'bio' => ['nullable', 'string', 'max:2000'],
            'avatar_url' => ['nullable', 'url', 'max:2048'],
            'location' => ['nullable', 'string', 'max:255'],
        ]);

        $user = $request->user();
        $user->update($data);

        return response()->json($user);
    }
}
