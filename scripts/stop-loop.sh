#!/usr/bin/env bash
# stop-loop.sh — stop the autonomous builder gracefully (after current iter)
# or forcefully (--force).
set -euo pipefail

REPO="$(cd "$(dirname "$0")/.." && pwd)"
STOP_FILE="$REPO/.loop-stop"

if [[ "${1:-}" == "--force" ]]; then
  echo "force-killing loop process(es)..."
  pkill -f "$REPO/scripts/loop.sh" && echo "killed" || echo "no running loop found"
  rm -f "$STOP_FILE"
  exit 0
fi

if pgrep -f "$REPO/scripts/loop.sh" >/dev/null; then
  touch "$STOP_FILE"
  echo "stop file created at $STOP_FILE — loop will exit after current iteration."
  echo "  (use --force to kill immediately)"
else
  echo "no running loop found"
fi
