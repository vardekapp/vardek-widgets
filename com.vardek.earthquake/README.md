# Earthquake Monitor

World map plotting recent earthquakes from the USGS Earthquake Hazards Program
(GeoJSON feed, no API key needed) — dots sized and colored by magnitude.

- **Positions** refresh every 10 minutes.
- **Dot size** grows with magnitude; **color** ramps amber (low) to red (high).
- Coastlines are optional and drawn from bundled Natural Earth data (no network).

## Settings

| Key            | Type    | Default | Description                          |
|----------------|---------|---------|---------------------------------------|
| `minMagnitude` | enum    | `2.5`   | Minimum magnitude to show (1.0/2.5/4.5) |
| `window`       | enum    | `24h`   | Time window to query (24h/7d)         |
| `showLand`     | boolean | `true`  | Show coastlines                       |

Note: like other Vardek carousel widgets, this widget's refresh is paused while
its page is off-screen in the carousel and resumes when it becomes visible again.

## Install

```sh
./install-addon.sh com.vardek.earthquake
```

See the [repo README](../README.md) for manual install and uninstall.

## Data

Live earthquake data from the [USGS FDSN Event Web Service](https://earthquake.usgs.gov/fdsnws/event/1/)
(GeoJSON, public domain, no key required). `land.js` bundles simplified Natural
Earth 1:110m land polygons (public domain) — coastlines only, no network for those.
