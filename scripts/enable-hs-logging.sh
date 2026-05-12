#!/usr/bin/env bash
# enable-hs-logging.sh — write Hearthstone's log.config so Power.log
# emits verbose events live. Idempotent; safe to re-run.
set -euo pipefail

CONFIG_DIR="$HOME/Library/Preferences/Blizzard/Hearthstone"
CONFIG="$CONFIG_DIR/log.config"
mkdir -p "$CONFIG_DIR"

# Sections we need for the overlay
WANT=(Power Zone Net.Mgr Bob LoadingScreen Asset)

# If the file exists, back it up once
if [[ -f "$CONFIG" && ! -f "$CONFIG.backup" ]]; then
  cp "$CONFIG" "$CONFIG.backup"
  echo "backed up existing config → $CONFIG.backup"
fi

# Write a fresh config (Hearthstone tolerates a clean slate)
{
  for section in "${WANT[@]}"; do
    cat <<EOF
[$section]
LogLevel=1
FilePrinting=true
ConsolePrinting=false
ScreenPrinting=false
Verbose=true

EOF
  done
} > "$CONFIG"

echo "wrote $CONFIG with verbose sections: ${WANT[*]}"
echo "restart Hearthstone for changes to take effect."
