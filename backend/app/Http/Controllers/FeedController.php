<?php

namespace App\Http\Controllers;

use App\Models\Listing;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class FeedController extends Controller
{
    /**
     * GET /api/feed  ->  Feed of advertised goods.
     *
     * Promoted listings float to the top, then newest first. Supports
     * ?category= and ?q= filters plus simple pagination.
     */
    public function index(Request $request): JsonResponse
    {
        $listings = Listing::query()
            ->with('user:id,name,username,avatar_url')
            ->when($request->filled('category'), fn ($q) => $q->where('category', $request->string('category')))
            ->when($request->filled('q'), function ($q) use ($request) {
                $term = '%'.$request->string('q').'%';
                $q->where(fn ($sub) => $sub->where('title', 'ilike', $term)
                    ->orWhere('description', 'ilike', $term));
            })
            ->orderByDesc('is_promoted')
            ->latest()
            ->paginate(12);

        return response()->json($listings);
    }

    /**
     * POST /api/feed  ->  Advertise a new good.
     */
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:5000'],
            'price_cents' => ['required', 'integer', 'min:0'],
            'currency' => ['nullable', 'string', 'size:3'],
            'category' => ['nullable', 'string', 'max:100'],
            'image_url' => ['nullable', 'url', 'max:2048'],
            'is_promoted' => ['boolean'],
        ]);

        $listing = $request->user()->listings()->create($data);

        return response()->json($listing->load('user:id,name,username,avatar_url'), 201);
    }
}
