#!/usr/bin/env bash
#
# NeonMarket — one-shot setup for WSL Ubuntu.
#
# Installs PHP 8.2 (+ PostgreSQL/extensions), Composer, and Node 20, then
# installs project dependencies and prepares the Laravel backend.
#
# Usage (from the repo root, inside WSL):
#   chmod +x setup.sh
#   ./setup.sh
#
# Assumes PostgreSQL is already running with the database/user you created:
#   DB: laravelapp  USER: laraveluser  PASSWORD: password
# Edit backend/.env if yours differ.
#
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT"

say() { printf '\n\033[1;36m==> %s\033[0m\n' "$1"; }

# ---------------------------------------------------------------------------
# 1. System packages: PHP 8.2 + extensions, Composer prerequisites, Node 20
# ---------------------------------------------------------------------------
say "Installing system packages (sudo required)"
sudo apt-get update -y
sudo apt-get install -y software-properties-common ca-certificates curl unzip git gnupg

# Ondřej PPA gives us PHP 8.2 on any Ubuntu release.
if ! php -v 2>/dev/null | grep -q "PHP 8.[2-9]"; then
  sudo add-apt-repository -y ppa:ondrej/php
  sudo apt-get update -y
fi

sudo apt-get install -y \
  php8.2 php8.2-cli php8.2-common \
  php8.2-pgsql php8.2-sqlite3 php8.2-mbstring php8.2-xml php8.2-bcmath \
  php8.2-curl php8.2-zip php8.2-intl

# ---------------------------------------------------------------------------
# 2. Composer (global)
# ---------------------------------------------------------------------------
if ! command -v composer >/dev/null 2>&1; then
  say "Installing Composer"
  EXPECTED="$(curl -fsSL https://composer.github.io/installer.sig)"
  curl -fsSL https://getcomposer.org/installer -o /tmp/composer-setup.php
  ACTUAL="$(php -r "echo hash_file('sha384', '/tmp/composer-setup.php');")"
  [ "$EXPECTED" = "$ACTUAL" ] || { echo "Composer installer checksum mismatch"; exit 1; }
  sudo php /tmp/composer-setup.php --install-dir=/usr/local/bin --filename=composer
  rm -f /tmp/composer-setup.php
fi

# ---------------------------------------------------------------------------
# 3. Node 20 (for the frontend)
# ---------------------------------------------------------------------------
if ! command -v node >/dev/null 2>&1; then
  say "Installing Node.js 20"
  curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
  sudo apt-get install -y nodejs
fi

# ---------------------------------------------------------------------------
# 4. Backend: deps, env, key, migrate + seed
# ---------------------------------------------------------------------------
say "Setting up Laravel backend"
cd "$ROOT/backend"
composer install
[ -f .env ] || cp .env.example .env
php artisan key:generate
php artisan migrate --seed

# ---------------------------------------------------------------------------
# 5. Frontend: deps
# ---------------------------------------------------------------------------
say "Installing frontend dependencies"
cd "$ROOT/frontend"
npm install

say "Done."
cat <<'EOF'

Start the app with two terminals:

  Terminal 1 (API):
    cd backend && php artisan serve        # http://localhost:8000

  Terminal 2 (SPA):
    cd frontend && npm run dev             # http://localhost:5173

Demo login:  demo@neonmarket.test  /  password
EOF
