# World Clocks (`com.vardek.world-clocks`)

## Summary

Newsroom-wall-clock-style add-on widget: 2-4 round analog clocks (white
face, black numerals/hands, red sweeping second hand), each labeled with a
city name and its time offset relative to the first clock. User picks
cities from dropdowns (min 2, max 4). Pure client-side, no network.

## Files

```
vardek-widgets/com.vardek.world-clocks/
├── manifest.json
├── index.html
└── README.md
```

Also touches `vardek-widgets/README.md` (new table row) and
`nixie-clock`-style screenshot(s) added later (not part of this pass).

## manifest.json

Two sizes, both fluid (no `canvas`):

```json
{
  "id": "com.vardek.world-clocks",
  "name": "World Clocks",
  "version": "1.0.0",
  "entry": "index.html",
  "icon": "🕐",
  "subscriptions": [],
  "sizes": [
    { "cols": 8, "rows": 2 },
    { "cols": 4, "rows": 2 }
  ],
  "settingsSchema": {
    "city1": { "type": "enum", "label": "City 1", "default": "New York, United States", "values": [ /* full city list, no "None" */ ] },
    "city2": { "type": "enum", "label": "City 2", "default": "London, United Kingdom", "values": [ /* full city list, no "None" */ ] },
    "city3": { "type": "enum", "label": "City 3", "default": "Tokyo, Japan", "values": [ "None", /* full city list */ ] },
    "city4": { "type": "enum", "label": "City 4", "default": "None", "values": [ "None", /* full city list */ ] }
  }
}
```

`city1`/`city2` are required (no "None" choice — matches the "minimum two
locations" constraint structurally, not just by validation). `city3`/`city4`
default to `"None"` and can be set back to it to drop a slot. No
`permissions` block — everything is computed from the browser's own clock
via `Intl`, no network calls.

City list values reuse the Weather widget's exact ~120-city
`"City, Country"` string list (`vardek-app/widgets/com.vardek.weather/manifest.json`)
for consistency across the app. Each string maps to an IANA timezone via a
lookup table baked into `index.html` (below) — the manifest strings
themselves are unchanged from Weather's list.

## City → IANA timezone table

A `TZ_BY_CITY` object in `index.html`, one entry per Weather-widget city
string, e.g.:

```js
const TZ_BY_CITY = {
  "Abu Dhabi, United Arab Emirates": "Asia/Dubai",
  "Accra, Ghana": "Africa/Accra",
  "Addis Ababa, Ethiopia": "Africa/Addis_Ababa",
  "Amman, Jordan": "Asia/Amman",
  "Amsterdam, Netherlands": "Europe/Amsterdam",
  "Anchorage, United States": "America/Anchorage",
  "Astana, Kazakhstan": "Asia/Almaty",
  "Athens, Greece": "Europe/Athens",
  "Atlanta, United States": "America/New_York",
  "Auckland, New Zealand": "Pacific/Auckland",
  "Baghdad, Iraq": "Asia/Baghdad",
  "Bali, Indonesia": "Asia/Makassar",
  "Bangkok, Thailand": "Asia/Bangkok",
  "Barcelona, Spain": "Europe/Madrid",
  "Beijing, China": "Asia/Shanghai",
  "Beirut, Lebanon": "Asia/Beirut",
  "Belgrade, Serbia": "Europe/Belgrade",
  "Berlin, Germany": "Europe/Berlin",
  "Bogotá, Colombia": "America/Bogota",
  "Boston, United States": "America/New_York",
  "Brasília, Brazil": "America/Sao_Paulo",
  "Brisbane, Australia": "Australia/Brisbane",
  "Brussels, Belgium": "Europe/Brussels",
  "Bucharest, Romania": "Europe/Bucharest",
  "Budapest, Hungary": "Europe/Budapest",
  "Buenos Aires, Argentina": "America/Argentina/Buenos_Aires",
  "Cairo, Egypt": "Africa/Cairo",
  "Calgary, Canada": "America/Edmonton",
  "Cape Town, South Africa": "Africa/Johannesburg",
  "Caracas, Venezuela": "America/Caracas",
  "Casablanca, Morocco": "Africa/Casablanca",
  "Chengdu, China": "Asia/Shanghai",
  "Chennai, India": "Asia/Kolkata",
  "Chicago, United States": "America/Chicago",
  "Colombo, Sri Lanka": "Asia/Colombo",
  "Copenhagen, Denmark": "Europe/Copenhagen",
  "Dallas, United States": "America/Chicago",
  "Dar es Salaam, Tanzania": "Africa/Dar_es_Salaam",
  "Delhi, India": "Asia/Kolkata",
  "Denver, United States": "America/Denver",
  "Dhaka, Bangladesh": "Asia/Dhaka",
  "Doha, Qatar": "Asia/Qatar",
  "Dubai, United Arab Emirates": "Asia/Dubai",
  "Dublin, Ireland": "Europe/Dublin",
  "Edinburgh, United Kingdom": "Europe/London",
  "Frankfurt, Germany": "Europe/Berlin",
  "Guadalajara, Mexico": "America/Mexico_City",
  "Hanoi, Vietnam": "Asia/Ho_Chi_Minh",
  "Havana, Cuba": "America/Havana",
  "Helsinki, Finland": "Europe/Helsinki",
  "Ho Chi Minh City, Vietnam": "Asia/Ho_Chi_Minh",
  "Hong Kong": "Asia/Hong_Kong",
  "Honolulu, United States": "Pacific/Honolulu",
  "Houston, United States": "America/Chicago",
  "Istanbul, Turkey": "Europe/Istanbul",
  "Jakarta, Indonesia": "Asia/Jakarta",
  "Johannesburg, South Africa": "Africa/Johannesburg",
  "Kabul, Afghanistan": "Asia/Kabul",
  "Karachi, Pakistan": "Asia/Karachi",
  "Kathmandu, Nepal": "Asia/Kathmandu",
  "Kiev, Ukraine": "Europe/Kyiv",
  "Kolkata, India": "Asia/Kolkata",
  "Kuala Lumpur, Malaysia": "Asia/Kuala_Lumpur",
  "Kuwait City, Kuwait": "Asia/Kuwait",
  "Lagos, Nigeria": "Africa/Lagos",
  "Las Vegas, United States": "America/Los_Angeles",
  "Lima, Peru": "America/Lima",
  "Lisbon, Portugal": "Europe/Lisbon",
  "London, United Kingdom": "Europe/London",
  "Los Angeles, United States": "America/Los_Angeles",
  "Madrid, Spain": "Europe/Madrid",
  "Manila, Philippines": "Asia/Manila",
  "Melbourne, Australia": "Australia/Melbourne",
  "Mexico City, Mexico": "America/Mexico_City",
  "Miami, United States": "America/New_York",
  "Milan, Italy": "Europe/Rome",
  "Minneapolis, United States": "America/Chicago",
  "Montreal, Canada": "America/Toronto",
  "Moscow, Russia": "Europe/Moscow",
  "Mumbai, India": "Asia/Kolkata",
  "Munich, Germany": "Europe/Berlin",
  "Muscat, Oman": "Asia/Muscat",
  "Nairobi, Kenya": "Africa/Nairobi",
  "New York, United States": "America/New_York",
  "Osaka, Japan": "Asia/Tokyo",
  "Oslo, Norway": "Europe/Oslo",
  "Paris, France": "Europe/Paris",
  "Perth, Australia": "Australia/Perth",
  "Philadelphia, United States": "America/New_York",
  "Phnom Penh, Cambodia": "Asia/Phnom_Penh",
  "Phoenix, United States": "America/Phoenix",
  "Prague, Czech Republic": "Europe/Prague",
  "Pyongyang, North Korea": "Asia/Pyongyang",
  "Reykjavik, Iceland": "Atlantic/Reykjavik",
  "Rio de Janeiro, Brazil": "America/Sao_Paulo",
  "Riyadh, Saudi Arabia": "Asia/Riyadh",
  "Rome, Italy": "Europe/Rome",
  "San Francisco, United States": "America/Los_Angeles",
  "Santiago, Chile": "America/Santiago",
  "São Paulo, Brazil": "America/Sao_Paulo",
  "Seattle, United States": "America/Los_Angeles",
  "Seoul, South Korea": "Asia/Seoul",
  "Shanghai, China": "Asia/Shanghai",
  "Singapore": "Asia/Singapore",
  "Sofia, Bulgaria": "Europe/Sofia",
  "St. Petersburg, Russia": "Europe/Moscow",
  "Stockholm, Sweden": "Europe/Stockholm",
  "Sydney, Australia": "Australia/Sydney",
  "Taipei, Taiwan": "Asia/Taipei",
  "Tashkent, Uzbekistan": "Asia/Tashkent",
  "Tehran, Iran": "Asia/Tehran",
  "Tel Aviv, Israel": "Asia/Jerusalem",
  "Tokyo, Japan": "Asia/Tokyo",
  "Toronto, Canada": "America/Toronto",
  "Tunis, Tunisia": "Africa/Tunis",
  "Ulaanbaatar, Mongolia": "Asia/Ulaanbaatar",
  "Vancouver, Canada": "America/Vancouver",
  "Vienna, Austria": "Europe/Vienna",
  "Warsaw, Poland": "Europe/Warsaw",
  "Washington DC, United States": "America/New_York",
  "Wellington, New Zealand": "Pacific/Auckland",
  "Yangon, Myanmar": "Asia/Yangon",
  "Zurich, Switzerland": "Europe/Zurich"
};
```

City name shown under each clock is the string before the first comma
(`"New York, United States"` → `"New York"`; bare `"Hong Kong"`/`"Singapore"`
stay as-is).

## Time computation

No server call, no polling — read the local machine's instant and re-express
it in each city's zone:

```js
function partsFor(tz) {
  const now = new Date();
  const fmt = new Intl.DateTimeFormat("en-US", {
    timeZone: tz, hour12: false,
    hour: "2-digit", minute: "2-digit", second: "2-digit"
  });
  const p = Object.fromEntries(fmt.formatToParts(now).map(x => [x.type, x.value]));
  const h = Number(p.hour) % 24;
  const m = Number(p.minute);
  const s = Number(p.second);
  const ms = now.getMilliseconds();
  return { h, m, s, ms };
}
```

Hand rotation (degrees), fractional so hands aren't jumpy:

```js
function angles({ h, m, s, ms }) {
  const secFrac = s + ms / 1000;
  const minFrac = m + secFrac / 60;
  const hourFrac = (h % 12) + minFrac / 60;
  return {
    hourDeg: hourFrac * 30,   // 360/12
    minDeg: minFrac * 6,      // 360/60
    secDeg: secFrac * 6
  };
}
```

Recomputed every 1000ms via `setInterval`, applied as
`transform: rotate(Ndeg)` on each hand with a short CSS `transition` (~150ms
ease) so movement reads as a smooth sweep rather than a tick — same
smoothing trick used for the pattern, adapted from Nixie Clock's per-tick
DOM refresh cadence. No `prefers-reduced-motion` gating — the sweeping
second hand is the core identity of an analog clock, not decorative motion,
same reasoning already applied to Nixie Clock's ambient glow.

## Time-difference label

Computed once per tick alongside the angles: each city's UTC offset (via
`Intl.DateTimeFormat` with `timeZoneName: "shortOffset"`, or by diffing two
formatted instants) minus slot 1's offset, formatted as `"+8h"` / `"-5h"` /
`"+0.5h"` for half-hour-offset zones (e.g. India, Iran). Slot 1 shows no
diff line — just the city name.

## Layout

```
#root: flex row, flex-wrap, align-items:center, justify-content:center,
       width:100vw, height:100vh
.clock-slot: flex: 1 1 0, min-width driven by clamp(), column layout
             (face, then city name, then diff line)
```

- **8×2, 2-4 cities**: single row, each slot `flex:1` — 2 cities = each
  ~50% width, 4 cities = each ~25%. Matches "quarter of screen" at 4.
- **4×2, 2 cities**: single row, same stretch logic (each ~50%).
- **4×2, 3-4 cities**: `flex-wrap: wrap`, each slot given a `min-width`
  (via `clamp()`, roughly half the 4×2 iframe width) so 3-4 slots naturally
  wrap into a 2×2 (or 2+1) grid instead of squeezing into one cramped row.

Clock face diameter is `vmin`-relative (`min(vw, vh)`-based) so it scales
with whichever dimension is tighter, avoiding overflow in the 2-row height
at 8×2 or the narrower 4×2 width.

## Clock face (SVG)

One inline `<svg viewBox="0 0 100 100">` per clock, generated once per
slot (not rebuilt every tick — only the three `<line>`/`<polygon>` hand
transforms update):

- White circle face (`fill:#fff`), thin black stroke rim.
- 12 numerals (`1`-`12`), black, positioned via precomputed trig offsets at
  build time (12 fixed `<text>` elements, not regenerated).
- 60 tick marks (12 hour-ticks slightly longer/thicker, 48 minute-ticks
  thin) as a static `<g>`.
- Hour hand: short, thick, black. Minute hand: long, thinner, black. Second
  hand: thin, red, extends slightly past center on the back side (classic
  wall-clock counterweight look).
- Small black center hub circle on top of all three hands.

## JS structure

```js
const defaults = { city1: "New York, United States", city2: "London, United Kingdom",
                    city3: "Tokyo, Japan", city4: "None" };
let cfg = defaults;

function activeCities() {
  return [cfg.city1, cfg.city2, cfg.city3, cfg.city4].filter(c => c && c !== "None");
}

function render() {
  // rebuild #root's slot list from activeCities() — only when the
  // selection changes (on vardek:ready / settings change), not every tick
}

function tick() {
  // for each rendered slot, recompute angles()/diff label, apply transforms
}

document.addEventListener("vardek:ready", () => {
  cfg = Object.assign({}, defaults, Vardek.settings);
  render();
  tick();
});
render();  // default cities render standalone too, same zero-stub pattern as other widgets
tick();
setInterval(tick, 1000);
```

`render()` (slot DOM) and `tick()` (hand angles + diff labels) are split
so a settings change rebuilds slots without re-creating SVG nodes on every
1s tick.

## README.md

Same template shape as Nixie Clock's README (title, description, size
note, settings table, install snippet, notes). Notes section states: local
time only, no network permissions, timezone data from the browser's `Intl`
API (DST-aware).

Add a row to `vardek-widgets/README.md`'s widgets table near Nixie Clock.

## Testing / verification

Same approach as Nixie Clock: static serve, Chrome screenshot at 8×2 and
4×2 (2, 3, and 4 selected cities), console-stub `vardek:ready` with
different `Vardek.settings` to confirm slot count / wrapping / diff labels
update correctly, and a real-time check (watch one full second-hand sweep
to confirm smooth motion, not a jump-cut).

## Scope cuts (explicit)

- No digital time readout — analog only, matches the newsroom-wall-clock
  brief.
- No "current local time" auto-detected slot — all cities are explicit
  user picks, consistent with min-2/max-4 framing.
- No timezone abbreviation label (e.g. "GMT+3") — just the numeric diff,
  keeps the label line short at quarter-width.
