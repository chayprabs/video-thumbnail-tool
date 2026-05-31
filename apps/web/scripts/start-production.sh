#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
if [[ -f .next/standalone/apps/web/server.js ]]; then
  cp -r public .next/standalone/apps/web/public
  exec node .next/standalone/apps/web/server.js
fi
exec pnpm exec next start -p "${PORT:-3000}"
