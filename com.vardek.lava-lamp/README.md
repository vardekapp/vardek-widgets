# Lava Lamp

An ambient lava lamp for the panel — gooey blobs drift, rise, and merge across a
warm glowing field. Pure local animation: no network, no data, no persistence.

Built as a full-bleed lava field (the Xeneon Edge is far too wide for a lamp
silhouette), rendered with additive blurred blobs so overlaps blend like the real
thing. Kept deliberately light — a dozen-ish blobs at ~30fps.

## Settings

| Key           | Type    | Default   | Description                                            |
|---------------|---------|-----------|--------------------------------------------------------|
| `colorScheme` | enum    | `classic` | `classic` (70s red/gold), `aqua`, `toxic`, `sunset`, `ember`, `mono` |
| `speed`       | enum    | `medium`  | `slow` / `medium` / `fast`                             |
| `density`     | enum    | `some`    | Blob count — `few` (7) / `some` (12) / `many` (18)     |
| `glow`        | boolean | `true`    | Soft bloom around the blobs                            |

Sizes: **4×2** or **8×2** (fills either — the canvas is responsive).

## Note

Vardek throttles off-screen carousel pages, so the lamp pauses when its page isn't
the one being shown and resumes when it comes back into view. Give it its own page
(or the full 8×2) for continuous ooze.

## Install

```sh
./install-addon.sh com.vardek.lava-lamp
```

See the [repo README](../README.md) for manual install.
