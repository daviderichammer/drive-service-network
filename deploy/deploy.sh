#!/usr/bin/env bash
#
# Drive Service Network — deployment script (Priority 1 revamp)
#
# Run ON the Hetzner host (5.161.189.93) as root:
#
#   cd /opt/drive-service-network && bash deploy/deploy.sh
#
# The script is idempotent and safe to re-run. It refuses to proceed if the
# environment still references the obsolete Partner API.

set -euo pipefail

APP_DIR="${APP_DIR:-/opt/drive-service-network}"
BRANCH="${BRANCH:-main}"
SERVICE="driveservicenetwork"
ENV_FILE="${ENV_FILE:-/etc/dsn/production.env}"

say() { printf '\n\033[1;36m==> %s\033[0m\n' "$1"; }
die() { printf '\n\033[1;31mERROR: %s\033[0m\n' "$1" >&2; exit 1; }

[ -d "$APP_DIR" ] || die "Application directory ${APP_DIR} does not exist."
cd "$APP_DIR"

say "Fetching ${BRANCH} from origin"
git fetch --all --prune
git checkout "$BRANCH"
git reset --hard "origin/${BRANCH}"

say "Validating environment file"
[ -f "$ENV_FILE" ] || die "Missing ${ENV_FILE}."

# REVAMP BUILD section 2 — the Partner API must be gone.
if grep -qE '^\s*OPENBAY_API_(BASE_URL|KEY)=' "$ENV_FILE"; then
  die "${ENV_FILE} still defines Partner API variables (OPENBAY_API_*). Remove them; the Partner API is obsolete."
fi

for required in OPENBAY_PLATFORM_API_BASE_URL OPENBAY_PLATFORM_API_KEY OPENBAY_PLATFORM_PARTNER_ID DATABASE_URL NEXTAUTH_SECRET; do
  grep -qE "^\s*${required}=.+" "$ENV_FILE" || die "${ENV_FILE} is missing ${required}."
done

if grep -qE '^\s*OPENBAY_PLATFORM_API_KEY="?CHANGE_ME' "$ENV_FILE"; then
  die "OPENBAY_PLATFORM_API_KEY is still set to CHANGE_ME."
fi

say "Installing dependencies"
pnpm install --frozen-lockfile --prod=false

say "Applying database migrations"
set -a; . "$ENV_FILE"; set +a
pnpm exec prisma generate
# `migrate deploy` applies committed migrations without prompting. If the
# migrations folder is empty (first revamp deploy), fall back to db push so the
# new membership/vehicle columns land.
if [ -d prisma/migrations ] && [ -n "$(ls -A prisma/migrations 2>/dev/null)" ]; then
  pnpm exec prisma migrate deploy
else
  echo "No migrations directory — synchronising schema with prisma db push."
  pnpm exec prisma db push --accept-data-loss=false
fi

say "Building the application"
pnpm run build

say "Restarting ${SERVICE}"
systemctl daemon-reload
systemctl restart "$SERVICE"
sleep 4
systemctl --no-pager --lines=15 status "$SERVICE" || true

say "Health check"
PORT_NUM="$(grep -oP '(?<=^PORT=)\d+' "$ENV_FILE" || echo 3049)"
if curl -fsS --max-time 20 -H "x-dsn-internal-secret: ${INTERNAL_API_SECRET}" "http://127.0.0.1:${PORT_NUM}/api/platform/health" >/dev/null; then
  echo "Application is responding on port ${PORT_NUM}."
else
  die "Health endpoint did not respond. Check: journalctl -u ${SERVICE} -n 100"
fi

say "Deployment complete"
