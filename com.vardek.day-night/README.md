# Day/Night Map

World map with a live day/night terminator and UTC-offset time ticks.

- **Night shading** follows the real solar terminator, recomputed each minute
  from the current UTC instant (simplified NOAA solar-position math, no network).
- **Sun marker** sits at the subsolar point.
- **UTC ticks** (-12 … +14) label each offset band with its current local time.

## Settings

| Key            | Type    | Default | Description        |
|----------------|---------|---------|--------------------|
| `use24Hour`    | boolean | `true`  | 24-hour clock      |
| `showLand`     | boolean | `true`  | Show coastlines    |
| `showTwilight` | boolean | `true`  | Twilight gradient  |

## Data

`land.js` is generated from Natural Earth 1:110m land (public domain) by
`scripts/build-land-data.mjs`. Regenerate with `node scripts/build-land-data.mjs`.
