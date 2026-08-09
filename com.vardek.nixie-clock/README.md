# Nixie Clock

A clock styled like a physical nixie tube display — glowing glass-tube digits
for HH:MM:SS with a smaller glowing tube bank for the date below. Pick any
glow color via the color picker; faint ghost outlines of all ten digit shapes
sit behind each lit digit, plus a slow warm flicker, for a physical-tube feel
rather than a flat digital font.

Two sizes: 8×2 (full width) or 4×2 (half width) — the tube bank scales to fit.


## Settings

| Key           | Type    | Default   | Description                                    |
|---------------|---------|-----------|-------------------------------------------------|
| `use24Hour`   | boolean | `true`    | 24-hour vs 12-hour time                          |
| `showSeconds` | boolean | `true`    | Show the seconds tubes                           |
| `showDate`    | boolean | `true`    | Show the date tube bank below the time           |
| `glowColor`   | color   | `#ff9500` | Tube glow color (default: classic amber neon)    |

## Install

```sh
./install-addon.sh com.vardek.nixie-clock
```

See the [repo README](../README.md) for manual install and uninstall.

## Notes

Local time only — no network permissions, matches the bundled Clock widget.
