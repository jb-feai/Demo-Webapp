<?php

return [

    // Apply CORS to API routes, the Sanctum CSRF cookie, and login/logout.
    'paths' => ['api/*', 'sanctum/csrf-cookie', 'login', 'logout'],

    'allowed_methods' => ['*'],

    // The SPA origin(s). Defaults to the Vite dev server.
    'allowed_origins' => [
        env('FRONTEND_URL', 'http://localhost:5173'),
    ],

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    // Required so the browser will send the Sanctum session cookie.
    'supports_credentials' => true,

];
