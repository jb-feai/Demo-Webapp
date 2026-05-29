<?php

use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\ExploreController;
use App\Http\Controllers\FeedController;
use App\Http\Controllers\HomeController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API routes
|--------------------------------------------------------------------------
| Each frontend page has a matching "connect" point here. Public auth
| endpoints are open; everything else sits behind Sanctum auth plus the
| custom `active` middleware (rejects deactivated accounts).
*/

// --- Public: Login + Create Account ---
Route::prefix('auth')->group(function () {
    Route::post('register', [AuthController::class, 'register']);
    Route::post('login', [AuthController::class, 'login']);
});

// --- Protected: everything a signed-in member can reach ---
Route::middleware(['auth:sanctum', 'active'])->group(function () {

    // Session
    Route::get('auth/me', [AuthController::class, 'me']);
    Route::post('auth/logout', [AuthController::class, 'logout']);

    // Homepage endpoint
    Route::get('home', [HomeController::class, 'index']);
    Route::put('home/profile', [HomeController::class, 'update']);

    // Feed endpoint (advertised goods)
    Route::get('feed', [FeedController::class, 'index']);
    Route::post('feed', [FeedController::class, 'store']);

    // Social Explore endpoint (+ connect)
    Route::get('explore', [ExploreController::class, 'index']);
    Route::get('explore/requests', [ExploreController::class, 'requests']);
    Route::post('explore/{user}/connect', [ExploreController::class, 'connect']);
    Route::post('explore/connections/{connection}/respond', [ExploreController::class, 'respond']);
});
