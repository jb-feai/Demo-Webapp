# NeonMarket

An ecommerce **social network** — members get an account and home page, connect
with each other, and browse a feed of advertised goods.

This repo contains the **basic infrastructure**: a Laravel API, a React + MUI SPA
with a clean neon theme, and deployment configs for NGINX + PostgreSQL + PHP-FPM.

```
Demo-Webapp/
├── backend/     Laravel 11 API (PHP 8.2, PostgreSQL, Sanctum token auth)
├── frontend/    React 18 + Material UI SPA (Vite), responsive neon theme
├── deploy/      NGINX site configs (bare-metal + docker)
└── docker-compose.yml   Local Postgres + PHP-FPM + NGINX stack
```

## Stack

| Layer      | Tech                                                    |
|------------|---------------------------------------------------------|
| Frontend   | React 18, Material UI 5, React Router, Axios, Vite      |
| Backend    | Laravel 11, Laravel Sanctum (bearer tokens)             |
| Database   | PostgreSQL 16                                           |
| Web server | NGINX (static SPA + reverse proxy to PHP-FPM)           |

## Endpoints & pages

Each frontend page has a matching API "connect" point, all defined in
[backend/routes/api.php](backend/routes/api.php):

| Page (SPA route)        | API endpoint(s)                                          | Auth |
|-------------------------|----------------------------------------------------------|------|
| Login `/login`          | `POST /api/auth/login`                                   | public |
| Create Account `/register` | `POST /api/auth/register`                             | public |
| Homepage `/`            | `GET /api/home`, `PUT /api/home/profile`                 | required |
| Feed `/feed`            | `GET /api/feed`, `POST /api/feed`                        | required |
| Social Explore `/explore` | `GET /api/explore`, `GET /api/explore/requests`, `POST /api/explore/{user}/connect`, `POST /api/explore/connections/{connection}/respond` | required |

Protected routes sit behind two middleware: `auth:sanctum` and a custom
[`active`](backend/app/Http/Middleware/EnsureAccountIsActive.php) middleware that
rejects deactivated accounts.

## Quick start (Docker)

Requires Docker + Node 18+.

```bash
# 1. Backend deps + DB (run inside the app container)
docker compose up -d
docker compose exec app composer install
cp backend/.env.example backend/.env
docker compose exec app php artisan key:generate
docker compose exec app php artisan migrate --seed

# 2. Frontend
cd frontend
npm install
npm run dev          # http://localhost:5173 (proxies /api -> :8000)
```

Demo login: **demo@neonmarket.test** / **password**

## Quick start (bare metal — Linux PHP server)

```bash
# Backend
cd backend
composer install
cp .env.example .env          # set DB_* to your PostgreSQL instance
php artisan key:generate
php artisan migrate --seed
php artisan serve             # dev server on :8000 (use PHP-FPM + NGINX in prod)

# Frontend
cd ../frontend
npm install
npm run build                 # outputs to frontend/dist
```

For production, point NGINX at [deploy/nginx/neonmarket.conf](deploy/nginx/neonmarket.conf):
it serves `frontend/dist` and proxies `/api` to PHP-FPM.

## Seeding more dummy data

`DatabaseSeeder` lays down the initial demo set. To **supplementally** grow the
network afterwards (additive — never wipes), use the custom Artisan command:

```bash
cd backend
php artisan network:populate                                  # +20 users, +60 listings, +40 connections
php artisan network:populate --users=50 --listings=200 --connections=120
php artisan network:populate --users=0 --listings=30 --connections=0   # just more listings
```

New listings are spread across **all** users (old + new), and connections are
generated coherently (no self-connections, no duplicate pair in either direction).

## Tests

A PHPUnit suite verifies the inserted data is coherent — correct counts, additive
behaviour, valid foreign keys, unique usernames/emails, well-formed prices, and
sound connections. Tests run against an isolated in-memory SQLite database
(configured in [backend/phpunit.xml](backend/phpunit.xml)), so they never touch
your PostgreSQL data.

```bash
cd backend
php artisan test                       # or: ./vendor/bin/phpunit
php artisan test --filter=PopulateNetworkTest
```

> Requires the `php8.2-sqlite3` extension (included in `setup.sh`).

## Data model

- **users** — account + profile/home-page fields (`headline`, `bio`, `avatar_url`, `location`, `is_active`)
- **connections** — directed `requester → addressee` rows with `pending|accepted|declined` status
- **listings** — advertised goods (`title`, `price_cents`, `category`, `is_promoted`, …)

See [backend/database/migrations/](backend/database/migrations/).

## Notes

- Auth uses **Sanctum personal access tokens** (bearer). The SPA stores the token
  in `localStorage` and attaches it via an Axios interceptor
  ([frontend/src/api/client.js](frontend/src/api/client.js)). Sanctum's stateful
  cookie mode is also wired up (CORS + `SANCTUM_STATEFUL_DOMAINS`) if you prefer
  same-site cookie auth later.
- The neon theme lives in [frontend/src/theme.js](frontend/src/theme.js); layout is
  responsive (top nav on desktop, bottom nav on mobile).
- Seeded demo data: 16 users, 40 listings, sample connections + pending requests.
