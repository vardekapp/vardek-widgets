# Day/Night Map

World map with a live day/night terminator and UTC-offset time ticks.

![Day/Night Map widget](daynight.png)

- **Night shading** follows the real solar terminator, recomputed each minute
  from the current UTC instant (simplified NOAA solar-position math, no network).
- **Sun marker** sits at the subsolar point.
- **UTC ticks** (-12 … +12) label each offset band with its current local time.

## Settings

| Key            | Type    | Default | Description        |
|----------------|---------|---------|--------------------|
| `use24Hour`    | boolean | `true`  | 24-hour clock      |
| `showLand`     | boolean | `true`  | Show coastlines    |
| `showTwilight` | boolean | `true`  | Twilight gradient  |

## Install

```sh
./install-addon.sh com.vardek.day-night
```

See the [repo README](../README.md) for manual install and uninstall.

## Data

`land.js` bundles simplified Natural Earth 1:110m land polygons (public domain) —
coastlines only, no network at runtime.
