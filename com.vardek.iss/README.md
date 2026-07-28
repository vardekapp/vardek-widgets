# ISS Tracker

Standalone world map showing the International Space Station's live position,
via [wheretheiss.at](https://wheretheiss.at/) (no API key needed).

- **Position** refreshes every 15 seconds.
- **Marker** is an amber glowing dot at the ISS's current lat/lon.
- **Trail** (optional) traces the last ~15 minutes of positions; segments that
  cross the ±180° seam are not connected.
- Coastlines are optional and drawn from bundled Natural Earth data (no network).

## Settings

| Key         | Type    | Default | Description                          |
|-------------|---------|---------|---------------------------------------|
| `showLand`  | boolean | `true`  | Show coastlines                       |
| `showTrail` | boolean | `true`  | Show recent ground-track trail        |
| `units`     | enum    | `km`    | Altitude/velocity units (km/mi)       |

Note: like other Vardek carousel widgets, this widget's refresh is paused
while its page is off-screen in the carousel and resumes when it becomes
visible again. The trail is session-only and resets on reload.

## Install

```sh
./install-addon.sh com.vardek.iss
```

See the [repo README](../README.md) for manual install and uninstall.

## Data

Live ISS position from the [wheretheiss.at API](https://wheretheiss.at/w/developer)
(public, no key required). `land.js` bundles simplified Natural Earth 1:110m
land polygons (public domain) — coastlines only, no network for those.
