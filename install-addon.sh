#!/usr/bin/env bash
# Copy an add-on widget into your Vardek user widgets folder. Then open
# Vardek → Settings → Widgets, press Rescan, and approve the widget.
#
#   ./install-addon.sh app.vardek.day-night
#
# Uninstall = delete the folder, then Rescan in Settings.
set -euo pipefail

SRC="${1:?usage: install-addon.sh <path-to-widget-folder>}"
SRC="${SRC%/}"
ID="$(basename "$SRC")"
DEST="$HOME/Library/Application Support/Vardek/widgets"

[[ -f "$SRC/manifest.json" ]] || { echo "error: no manifest.json in $SRC" >&2; exit 1; }
case "$ID" in
  com.vardek.*|installation.*) echo "error: $ID uses a reserved id prefix; Vardek will not load it" >&2; exit 1 ;;
esac
grep -q "\"id\": *\"$ID\"" "$SRC/manifest.json" || { echo "error: folder name must match manifest id" >&2; exit 1; }

mkdir -p "$DEST"
rm -rf "${DEST:?}/$ID"
cp -R "$SRC" "$DEST/$ID"
echo "installed $ID -> $DEST/$ID"

# Official add-ons were renamed com.vardek.* -> app.vardek.* (Vardek 1.0.19);
# 1.0.18+ ignores the old name, so remove the old copy of this one.
OLD="$DEST/com.vardek.${ID#app.vardek.}"
if [[ "$ID" == app.vardek.* && -d "$OLD" ]]; then
  rm -rf "$OLD"
  echo "removed old copy $OLD"
fi

echo "Now open Vardek → Settings → Widgets, press Rescan, and approve $ID."
