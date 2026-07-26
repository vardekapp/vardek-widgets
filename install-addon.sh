#!/usr/bin/env bash
# Install an add-on widget into the local Vardek user widgets dir, then rescan
# the running daemon so it appears in Admin — no rebuild, no restart.
#
#   ./install-addon.sh com.vardek.day-night
#
# The user dir wins over bundled widgets on id collision, so this also lets you
# override a shipped widget locally. Uninstall = delete the folder + rescan.
set -euo pipefail

SRC="${1:?usage: install-addon.sh <path-to-widget-folder>}"
SRC="${SRC%/}"
ID="$(basename "$SRC")"
PORT="${VARDEK_PORT:-8137}"
DEST="$HOME/Library/Application Support/Vardek/widgets"

[[ -f "$SRC/manifest.json" ]] || { echo "error: no manifest.json in $SRC" >&2; exit 1; }

mkdir -p "$DEST"
rm -rf "${DEST:?}/$ID"
cp -R "$SRC" "$DEST/$ID"
echo "installed $ID -> $DEST/$ID"

if curl -fsS -X POST -H "X-Vardek-Relay: 1" "http://127.0.0.1:$PORT/api/widgets/rescan"; then
  echo "rescan OK — widget is now in Admin"
else
  echo "rescan failed (daemon not running on :$PORT?); it will load on next daemon start" >&2
fi
