<?php

use App\Http\Middleware\EnsureAccountIsActive;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
        apiPrefix: 'api',
    )
    ->withMiddleware(function (Middleware $middleware) {
        // This SPA authenticates with Sanctum *bearer tokens* (stored client-side
        // and sent as `Authorization: Bearer ...`), so we deliberately do NOT call
        // $middleware->statefulApi(). Stateful/cookie mode would force CSRF
        // validation on the API and cause "CSRF token mismatch" (419) on login.

        // Custom named middleware usable per-route, e.g. ->middleware('active')
        $middleware->alias([
            'active' => EnsureAccountIsActive::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        // Always return JSON for API routes instead of redirecting to a login page.
        $exceptions->shouldRenderJsonWhen(function (Request $request, \Throwable $e) {
            return $request->is('api/*') || $request->expectsJson();
        });
    })->create();
