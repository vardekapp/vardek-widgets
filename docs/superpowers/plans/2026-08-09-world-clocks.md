# World Clocks Widget Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build `com.vardek.world-clocks`, a Vardek add-on widget showing 2-4
newsroom-style analog clocks (white face, black hands, red second hand),
each labeled with a city name and time offset vs. slot 1, picked via
dropdown settings (min 2, max 4 cities).

**Architecture:** Single-file widget (`manifest.json` + `index.html` +
`README.md`), classic `<script>`/`Vardek` bridge (no ES modules — sandboxed
opaque-origin iframe), same shape as the existing Nixie Clock widget. No
network permission — time computed from the browser's own clock via
`Intl.DateTimeFormat` per-city IANA timezone. SVG clock faces built once per
slot; only hand `transform`s update per tick.

**Tech Stack:** Plain HTML/CSS/JS (ES5-compatible, matches sibling
widgets), inline SVG for clock faces, `Intl.DateTimeFormat` for timezone
math. No build step, no test framework — this repo's widgets are static
files verified by manual browser inspection (see each task's Verify step).

## Global Constraints

- No ES modules — classic `<script>` tags only (opaque-origin sandbox
  constraint, see `AUTHORING.md`).
- No `permissions` block in manifest.json — this widget makes no network
  calls.
- `city1`/`city2` settings fields have no `"None"` value (structurally
  enforces the 2-city minimum); `city3`/`city4` default to `"None"`.
- City list values are the exact ~120 `"City, Country"` strings from
  `vardek-app/widgets/com.vardek.weather/manifest.json`'s `city` enum —
  copy verbatim, do not re-derive or reformat.
- Clock face: white circle, black numerals 1-12, black hour/minute hands,
  red second hand, smooth continuous sweep (no `prefers-reduced-motion`
  gating — analog motion is the widget's core identity, same precedent as
  Nixie Clock's flicker).
- City label under each clock = the substring before the first comma
  (`"New York, United States"` → `"New York"`; bare names like
  `"Singapore"` stay as-is).
- Layout: 8×2 always single row, slots `flex:1` (stretch to fill). 4×2 with
  2 cities also single row; 4×2 with 3-4 cities wraps to a grid via
  `flex-wrap`.
- Widget id: `com.vardek.world-clocks`, name: "World Clocks".

Full spec: `docs/superpowers/specs/2026-08-09-world-clocks-design.md`.

---

### Task 1: Manifest + city/timezone data + settings wiring

**Files:**
- Create: `com.vardek.world-clocks/manifest.json`
- Create: `com.vardek.world-clocks/index.html`

**Interfaces:**
- Produces: `TZ_BY_CITY` (object, `"City, Country"` string → IANA tz
  string), `defaults` (object: `city1`, `city2`, `city3`, `city4`), `cfg`
  (mutable, `Object.assign({}, defaults, Vardek.settings)` on
  `vardek:ready`), `activeCities()` (function, returns array of 2-4
  non-`"None"` city strings from `cfg`, in slot order).

- [ ] **Step 1: Write manifest.json with the full city list**

The `CITIES` array below is the exact ~120-city list from the Weather
widget (`vardek-app/widgets/com.vardek.weather/manifest.json`'s `city`
enum), identical set to the `TZ_BY_CITY` keys used in Step 3 below.

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
    "city1": { "type": "enum", "label": "City 1", "default": "New York, United States", "values": [
      "Abu Dhabi, United Arab Emirates", "Accra, Ghana", "Addis Ababa, Ethiopia", "Amman, Jordan",
      "Amsterdam, Netherlands", "Anchorage, United States", "Astana, Kazakhstan", "Athens, Greece",
      "Atlanta, United States", "Auckland, New Zealand", "Baghdad, Iraq", "Bali, Indonesia",
      "Bangkok, Thailand", "Barcelona, Spain", "Beijing, China", "Beirut, Lebanon",
      "Belgrade, Serbia", "Berlin, Germany", "Bogotá, Colombia", "Boston, United States",
      "Brasília, Brazil", "Brisbane, Australia", "Brussels, Belgium", "Bucharest, Romania",
      "Budapest, Hungary", "Buenos Aires, Argentina", "Cairo, Egypt", "Calgary, Canada",
      "Cape Town, South Africa", "Caracas, Venezuela", "Casablanca, Morocco", "Chengdu, China",
      "Chennai, India", "Chicago, United States", "Colombo, Sri Lanka", "Copenhagen, Denmark",
      "Dallas, United States", "Dar es Salaam, Tanzania", "Delhi, India", "Denver, United States",
      "Dhaka, Bangladesh", "Doha, Qatar", "Dubai, United Arab Emirates", "Dublin, Ireland",
      "Edinburgh, United Kingdom", "Frankfurt, Germany", "Guadalajara, Mexico", "Hanoi, Vietnam",
      "Havana, Cuba", "Helsinki, Finland", "Ho Chi Minh City, Vietnam", "Hong Kong",
      "Honolulu, United States", "Houston, United States", "Istanbul, Turkey", "Jakarta, Indonesia",
      "Johannesburg, South Africa", "Kabul, Afghanistan", "Karachi, Pakistan", "Kathmandu, Nepal",
      "Kiev, Ukraine", "Kolkata, India", "Kuala Lumpur, Malaysia", "Kuwait City, Kuwait",
      "Lagos, Nigeria", "Las Vegas, United States", "Lima, Peru", "Lisbon, Portugal",
      "London, United Kingdom", "Los Angeles, United States", "Madrid, Spain", "Manila, Philippines",
      "Melbourne, Australia", "Mexico City, Mexico", "Miami, United States", "Milan, Italy",
      "Minneapolis, United States", "Montreal, Canada", "Moscow, Russia", "Mumbai, India",
      "Munich, Germany", "Muscat, Oman", "Nairobi, Kenya", "New York, United States",
      "Osaka, Japan", "Oslo, Norway", "Paris, France", "Perth, Australia",
      "Philadelphia, United States", "Phnom Penh, Cambodia", "Phoenix, United States", "Prague, Czech Republic",
      "Pyongyang, North Korea", "Reykjavik, Iceland", "Rio de Janeiro, Brazil", "Riyadh, Saudi Arabia",
      "Rome, Italy", "San Francisco, United States", "Santiago, Chile", "São Paulo, Brazil",
      "Seattle, United States", "Seoul, South Korea", "Shanghai, China", "Singapore",
      "Sofia, Bulgaria", "St. Petersburg, Russia", "Stockholm, Sweden", "Sydney, Australia",
      "Taipei, Taiwan", "Tashkent, Uzbekistan", "Tehran, Iran", "Tel Aviv, Israel",
      "Tokyo, Japan", "Toronto, Canada", "Tunis, Tunisia", "Ulaanbaatar, Mongolia",
      "Vancouver, Canada", "Vienna, Austria", "Warsaw, Poland", "Washington DC, United States",
      "Wellington, New Zealand", "Yangon, Myanmar", "Zurich, Switzerland"
    ] },
    "city2": { "type": "enum", "label": "City 2", "default": "London, United Kingdom", "values": "SAME_ARRAY_AS_city1" },
    "city3": { "type": "enum", "label": "City 3", "default": "Tokyo, Japan", "values": "[\"None\", ...SAME_ARRAY_AS_city1]" },
    "city4": { "type": "enum", "label": "City 4", "default": "None", "values": "[\"None\", ...SAME_ARRAY_AS_city1]" }
  }
}
```

`"SAME_ARRAY_AS_city1"` is not literal JSON — it means: paste the identical
115-entry array from `city1.values` above. `city1`/`city2` arrays do NOT
include `"None"`. `city3`/`city4` arrays are `["None", ...that same list]`.
Do not hand-retype the list four times — copy/paste the one array from
`city1` into the other three fields (prepending `"None"` for city3/city4).

- [ ] **Step 2: Write index.html skeleton with TZ_BY_CITY and settings wiring**

```html
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>World Clocks</title>
<style>
  * { box-sizing: border-box; }
  html, body { margin: 0; padding: 0; }
  body {
    height: 100vh; width: 100vw; overflow: hidden;
    background: #050506;
    display: flex; align-items: center; justify-content: center;
  }
  #root {
    height: 100vh; width: 100vw;
    display: flex; flex-wrap: wrap; align-items: center; justify-content: center;
  }
</style>
</head>
<body>
<div id="root"></div>
<script>
  var TZ_BY_CITY = {
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

  var defaults = { city1: "New York, United States", city2: "London, United Kingdom",
                    city3: "Tokyo, Japan", city4: "None" };
  var cfg = defaults;

  function activeCities() {
    return [cfg.city1, cfg.city2, cfg.city3, cfg.city4].filter(function (c) {
      return c && c !== "None";
    });
  }

  function render() {
    var cities = activeCities();
    document.getElementById("root").textContent = cities.join(" | ");
  }

  document.addEventListener("vardek:ready", function () {
    cfg = Object.assign({}, defaults, Vardek.settings);
    render();
  });
  render();
</script>
</body>
</html>
```

`render()` is a text-only stub for this task — Task 2 replaces it with real
SVG clock markup. This step only proves settings wiring and city-list
filtering work.

- [ ] **Step 3: Verify manifest is valid JSON and city counts match**

Run: `python3 -c "import json; m = json.load(open('com.vardek.world-clocks/manifest.json')); c = m['settingsSchema']['city1']['values']; print(len(c), 'None' in c)"`
Expected: prints the city count (should match Weather widget's list length)
and `False` (city1 must not contain `"None"`).

Run: `python3 -c "import json; m = json.load(open('com.vardek.world-clocks/manifest.json')); c = m['settingsSchema']['city3']['values']; print('None' in c)"`
Expected: `True`.

- [ ] **Step 4: Verify TZ_BY_CITY covers every manifest city**

Run:
```bash
python3 -c "
import json, re
m = json.load(open('com.vardek.world-clocks/manifest.json'))
cities = set(m['settingsSchema']['city1']['values'])
html = open('com.vardek.world-clocks/index.html').read()
tz_block = re.search(r'TZ_BY_CITY = \{(.*?)\};', html, re.S).group(1)
mapped = set(re.findall(r'\"([^\"]+)\":\s*\"[^\"]+\"', tz_block))
missing = cities - mapped
print('missing:', missing if missing else 'none')
"
```
Expected: `missing: none`. If any city is missing, add it to `TZ_BY_CITY`
before proceeding.

- [ ] **Step 5: Manual browser check of settings wiring**

Run: `cd com.vardek.world-clocks && python3 -m http.server 8935 &`

Use the browser tool: navigate to `http://127.0.0.1:8935/index.html`,
confirm the page renders `New York, United States | London, United Kingdom
| Tokyo, Japan` (default `render()` stub, pipe-joined, no 4th city). Then
run via `javascript_tool`:

```js
Vardek = { settings: { city1: "Paris, France", city2: "Berlin, Germany", city3: "None", city4: "None" } };
document.dispatchEvent(new Event("vardek:ready"));
document.getElementById("root").textContent;
```

Expected result: `"Paris, France | Berlin, Germany"` (2 cities only,
`"None"` entries filtered out).

Kill the server: `pkill -f "http.server 8935"`.

- [ ] **Step 6: Commit**

```bash
git add com.vardek.world-clocks/manifest.json com.vardek.world-clocks/index.html
git commit -m "World Clocks: manifest, timezone data, settings wiring"
```

---

### Task 2: Static SVG clock face (no live hands yet)

**Files:**
- Modify: `com.vardek.world-clocks/index.html`

**Interfaces:**
- Consumes: `activeCities()` from Task 1.
- Produces: `buildClockSVG()` (function, no args, returns an SVG `<svg>`
  element with face/numerals/ticks and three hand elements with `id`
  attributes `"hand-hour"`, `"hand-minute"`, `"hand-second"` reachable via
  `svg.querySelector`), `cityLabel(cityString)` (function, string → string,
  the part before the first comma), `render()` (rewritten: builds one
  `.clock-slot` per active city, each containing `buildClockSVG()` output
  plus a `.city-name` div and a `.city-diff` div).

- [ ] **Step 1: Replace the `render()` stub and add clock-building code**

Replace the `<style>` block's `#root` rule and add slot/face CSS:

```css
  #root {
    height: 100vh; width: 100vw;
    display: flex; flex-wrap: wrap; align-items: center; justify-content: center;
  }
  .clock-slot {
    flex: 1 1 0; min-width: clamp(140px, 22vw, 420px);
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    padding: clamp(4px, 1vw, 16px);
  }
  .clock-slot svg { width: 100%; height: auto; max-width: min(38vh, 90%); }
  .city-name { color: #eee; font-family: ui-sans-serif, system-ui, sans-serif;
    font-weight: 600; font-size: clamp(11px, 1.6vw, 22px); margin-top: 0.4em; }
  .city-diff { color: #999; font-family: ui-sans-serif, system-ui, sans-serif;
    font-size: clamp(9px, 1.1vw, 15px); }
```

Add after `TZ_BY_CITY`:

```js
  function cityLabel(cityString) {
    var i = cityString.indexOf(",");
    return i === -1 ? cityString : cityString.slice(0, i);
  }

  var NS = "http://www.w3.org/2000/svg";
  function svgEl(tag, attrs) {
    var el = document.createElementNS(NS, tag);
    for (var k in attrs) el.setAttribute(k, attrs[k]);
    return el;
  }

  function buildClockSVG() {
    var svg = svgEl("svg", { viewBox: "0 0 100 100" });

    svg.appendChild(svgEl("circle", { cx: 50, cy: 50, r: 48, fill: "#fff", stroke: "#111", "stroke-width": 2 }));

    var ticks = svgEl("g", {});
    for (var i = 0; i < 60; i++) {
      var angle = i * 6;
      var isHour = i % 5 === 0;
      var len = isHour ? 6 : 3;
      var w = isHour ? 1.6 : 0.7;
      var line = svgEl("line", {
        x1: 50, y1: 4, x2: 50, y2: 4 + len,
        stroke: "#111", "stroke-width": w,
        transform: "rotate(" + angle + " 50 50)"
      });
      ticks.appendChild(line);
    }
    svg.appendChild(ticks);

    var numerals = svgEl("g", {});
    for (var n = 1; n <= 12; n++) {
      var a = (n * 30 - 90) * Math.PI / 180;
      var r = 36;
      var x = 50 + r * Math.cos(a);
      var y = 50 + r * Math.sin(a);
      var text = svgEl("text", {
        x: x, y: y + 3, "text-anchor": "middle",
        "font-size": 9, "font-family": "ui-sans-serif, system-ui, sans-serif",
        "font-weight": 700, fill: "#111"
      });
      text.textContent = String(n);
      numerals.appendChild(text);
    }
    svg.appendChild(numerals);

    svg.appendChild(svgEl("line", { id: "hand-hour", x1: 50, y1: 50, x2: 50, y2: 27,
      stroke: "#111", "stroke-width": 3.2, "stroke-linecap": "round" }));
    svg.appendChild(svgEl("line", { id: "hand-minute", x1: 50, y1: 50, x2: 50, y2: 16,
      stroke: "#111", "stroke-width": 2.2, "stroke-linecap": "round" }));
    svg.appendChild(svgEl("line", { id: "hand-second", x1: 50, y1: 58, x2: 50, y2: 12,
      stroke: "#d81c1c", "stroke-width": 1, "stroke-linecap": "round" }));

    svg.appendChild(svgEl("circle", { cx: 50, cy: 50, r: 2.2, fill: "#111" }));

    return svg;
  }

  function render() {
    var root = document.getElementById("root");
    root.textContent = "";
    activeCities().forEach(function (cityStr) {
      var slot = document.createElement("div");
      slot.className = "clock-slot";
      slot.dataset.city = cityStr;
      slot.appendChild(buildClockSVG());
      var name = document.createElement("div");
      name.className = "city-name";
      name.textContent = cityLabel(cityStr);
      slot.appendChild(name);
      var diff = document.createElement("div");
      diff.className = "city-diff";
      slot.appendChild(diff);
      root.appendChild(slot);
    });
  }
```

All three hands start pointing at 12 (`y2` values above center) until Task
3 wires up rotation.

- [ ] **Step 2: Manual browser check — face renders, hands present**

Serve and navigate as in Task 1 Step 6. Run via `javascript_tool`:

```js
({
  slots: document.querySelectorAll(".clock-slot").length,
  numerals: document.querySelectorAll(".clock-slot svg text").length,
  hourHand: !!document.querySelector("#hand-hour"),
  minuteHand: !!document.querySelector("#hand-minute"),
  secondHand: !!document.querySelector("#hand-second")
})
```

Expected: `{ slots: 3, numerals: 36, hourHand: true, minuteHand: true,
secondHand: true }` (3 default cities × 12 numerals = 36; only one
`#hand-hour` etc. queried per document, but since IDs repeat per slot this
just confirms at least one exists — fine for this check).

Take a screenshot (`computer` tool, `screenshot` action) and visually
confirm: white circles with black numerals 1-12, black hands at 12
o'clock, red second hand, "New York" / "London" / "Tokyo" labels
underneath. Kill the server.

- [ ] **Step 3: Commit**

```bash
git add com.vardek.world-clocks/index.html
git commit -m "World Clocks: static SVG clock face and slot rendering"
```

---

### Task 3: Live hand rotation + time-difference labels

**Files:**
- Modify: `com.vardek.world-clocks/index.html`

**Interfaces:**
- Consumes: `TZ_BY_CITY`, `activeCities()`, `cityLabel()` from Tasks 1-2.
  `.clock-slot` elements carry `data-city` (set in Task 2's `render()`).
- Produces: `partsFor(tz)` (function, IANA tz string → `{h, m, s, ms}`),
  `angles(parts)` (function → `{hourDeg, minDeg, secDeg}`), `offsetMinutes(tz)`
  (function, IANA tz string → signed integer minutes from UTC),
  `formatDiff(minutesDelta)` (function, signed integer → string like
  `"+8h"` / `"-5h"` / `"+5.5h"` / `""` for 0), `tick()` (function, no args,
  updates every rendered slot's hand transforms and `.city-diff` text).

- [ ] **Step 1: Add time math functions after `buildClockSVG`**

```js
  function partsFor(tz) {
    var now = new Date();
    var fmt = new Intl.DateTimeFormat("en-US", {
      timeZone: tz, hour12: false,
      hour: "2-digit", minute: "2-digit", second: "2-digit"
    });
    var parts = fmt.formatToParts(now);
    var p = {};
    parts.forEach(function (x) { p[x.type] = x.value; });
    var h = Number(p.hour) % 24;
    return { h: h, m: Number(p.minute), s: Number(p.second), ms: now.getMilliseconds() };
  }

  function angles(parts) {
    var secFrac = parts.s + parts.ms / 1000;
    var minFrac = parts.m + secFrac / 60;
    var hourFrac = (parts.h % 12) + minFrac / 60;
    return { hourDeg: hourFrac * 30, minDeg: minFrac * 6, secDeg: secFrac * 6 };
  }

  function offsetMinutes(tz) {
    var now = new Date();
    var fmt = new Intl.DateTimeFormat("en-US", {
      timeZone: tz, hour12: false,
      year: "numeric", month: "2-digit", day: "2-digit",
      hour: "2-digit", minute: "2-digit", second: "2-digit"
    });
    var p = {};
    fmt.formatToParts(now).forEach(function (x) { p[x.type] = x.value; });
    var asUTC = Date.UTC(Number(p.year), Number(p.month) - 1, Number(p.day),
      Number(p.hour) % 24, Number(p.minute), Number(p.second));
    return Math.round((asUTC - now.getTime()) / 60000);
  }

  function formatDiff(minutesDelta) {
    if (minutesDelta === 0) return "";
    var sign = minutesDelta > 0 ? "+" : "-";
    var abs = Math.abs(minutesDelta);
    var hours = abs / 60;
    var hoursStr = (hours % 1 === 0) ? String(hours) : hours.toFixed(1);
    return sign + hoursStr + "h";
  }
```

- [ ] **Step 2: Add `tick()` and wire it into the interval**

```js
  function tick() {
    var cities = activeCities();
    if (cities.length === 0) return;
    var baseOffset = offsetMinutes(TZ_BY_CITY[cities[0]]);
    var slots = document.querySelectorAll(".clock-slot");
    slots.forEach(function (slot) {
      var cityStr = slot.dataset.city;
      var tz = TZ_BY_CITY[cityStr];
      var a = angles(partsFor(tz));
      var hourHand = slot.querySelector("#hand-hour");
      var minHand = slot.querySelector("#hand-minute");
      var secHand = slot.querySelector("#hand-second");
      hourHand.setAttribute("transform", "rotate(" + a.hourDeg + " 50 50)");
      minHand.setAttribute("transform", "rotate(" + a.minDeg + " 50 50)");
      secHand.setAttribute("transform", "rotate(" + a.secDeg + " 50 50)");
      var diffEl = slot.querySelector(".city-diff");
      var delta = offsetMinutes(tz) - baseOffset;
      diffEl.textContent = formatDiff(delta);
    });
  }
```

Replace the bottom of the script (after `render();`) with:

```js
  document.addEventListener("vardek:ready", function () {
    cfg = Object.assign({}, defaults, Vardek.settings);
    render();
    tick();
  });
  render();
  tick();
  setInterval(tick, 1000);
```

Also add a short CSS transition on the hand lines so 1s-interval updates
read as a smooth sweep — add to the `.clock-slot svg` rule block:

```css
  .clock-slot svg line[id^="hand-"] { transition: transform 0.15s ease-out; }
```

- [ ] **Step 3: Manual check — hands move and match wall-clock time**

Serve and navigate as before. Run via `javascript_tool`:

```js
({
  hourTransform: document.querySelector("#hand-hour").getAttribute("transform"),
  diffLabels: Array.from(document.querySelectorAll(".city-diff")).map(function(d){return d.textContent;})
})
```

Expected: `hourTransform` is a non-empty `rotate(...)` string (not the
default unrotated state), and `diffLabels` is `["", "<nonzero>", "<nonzero>"]`
— slot 1 (New York) has an empty diff, London and Tokyo show their offsets
(e.g. `"+5h"` and `"+14h"` in US winter, adjusting for DST). Cross-check one
value by hand: as of this test's run time, compute NY→London offset
manually and confirm it matches.

Wait 2 seconds (`computer` action `wait`, duration 2) and re-read
`document.querySelector("#hand-second").getAttribute("transform")` —
confirm the degree value increased by roughly `2 * 6 = 12` degrees (allow
±3° slack for the poll timing). Kill the server.

- [ ] **Step 4: Commit**

```bash
git add com.vardek.world-clocks/index.html
git commit -m "World Clocks: live hand rotation and time-difference labels"
```

---

### Task 4: Responsive layout at 8×2 and 4×2, screenshots, README, repo index

**Files:**
- Modify: `com.vardek.world-clocks/index.html` (layout-only CSS tuning if
  screenshots reveal overflow/cramping)
- Create: `com.vardek.world-clocks/README.md`
- Create: `com.vardek.world-clocks/world-clocks-8x2.png`
- Modify: `vardek-widgets/README.md`

**Interfaces:**
- Consumes: everything from Tasks 1-3. No new functions produced — this
  task is visual verification, docs, and asset capture only.

- [ ] **Step 1: Visual check at 8×2 with 4 cities (widest case)**

Serve the widget folder (`python3 -m http.server 8935` from inside
`com.vardek.world-clocks/`). Navigate the browser tab to
`http://127.0.0.1:8935/index.html`, resize the window so the page's
`window.innerWidth`/`innerHeight` (verify via `javascript_tool`) is as
close to `2560x720` as achievable, then run:

```js
Vardek = { settings: { city1: "New York, United States", city2: "London, United Kingdom",
                        city3: "Tokyo, Japan", city4: "Sydney, Australia" } };
document.dispatchEvent(new Event("vardek:ready"));
```

Take a screenshot. Confirm 4 clocks in a single row, none clipped, city
names and diff labels legible, no horizontal scrollbar.

If any clock face overflows its slot or text clips, adjust
`.clock-slot { min-width: clamp(...) }` or `.clock-slot svg { max-width:
... }` bounds in `index.html` and re-check before continuing.

- [ ] **Step 2: Visual check at 4×2 with 2 cities (single row) and 4 cities (wrap)**

Resize the browser window to approximate half the previous width, same
height (~1280×720 viewport, exact value may drift per Task-1-era notes on
this environment's window-sizing quirks — use whatever `innerWidth` you
actually get, just confirm it's roughly half of the 8×2 check).

Run:
```js
Vardek = { settings: { city1: "New York, United States", city2: "London, United Kingdom",
                        city3: "None", city4: "None" } };
document.dispatchEvent(new Event("vardek:ready"));
```
Screenshot — confirm 2 clocks side by side, reasonably sized (not tiny).

Then run:
```js
Vardek = { settings: { city1: "New York, United States", city2: "London, United Kingdom",
                        city3: "Tokyo, Japan", city4: "Sydney, Australia" } };
document.dispatchEvent(new Event("vardek:ready"));
```
Screenshot — confirm 4 clocks wrap into a 2×2 grid (via `flex-wrap`), not
squeezed into one cramped row. If they don't wrap, lower the `min-width`
clamp floor in `.clock-slot` until they do at this width, without shrinking
the 8×2 4-city case from Step 1 below its current comfortable size — re-run
Step 1's check after any change.

- [ ] **Step 3: Capture and save the canonical 8×2 screenshot**

With the browser back at the widest (8×2, ~2560×720) viewport and 4 cities
set (from Step 1's state), take a screenshot with `save_to_disk: true`.
Convert/resize the saved file to exactly 2560×720 PNG (matching every
other widget screenshot's resolution) and save it to
`com.vardek.world-clocks/world-clocks-8x2.png`:

```bash
sips -s format png -z 720 2560 "<screenshot-path-from-tool-output>" --out com.vardek.world-clocks/world-clocks-8x2.png
sips -g pixelWidth -g pixelHeight com.vardek.world-clocks/world-clocks-8x2.png
```

Expected: `pixelWidth: 2560`, `pixelHeight: 720`. Stop the local server
(`pkill -f "http.server 8935"`).

- [ ] **Step 4: Write README.md**

```markdown
# World Clocks

Newsroom-wall-clock-style display of 2-4 analog clocks at once — white
face, black hour/minute hands, sweeping red second hand, classic 1-12
numerals. Pick 2 to 4 cities from the dropdowns; each clock is labeled with
its city name and its time difference relative to the first city (the
first clock shows no offset).

![8x2, four cities](world-clocks-8x2.png)

At 8×2 all clocks share a single row, scaling to fill the width. At 4×2,
two cities still sit side by side; three or four wrap into a 2×2 grid so
each clock stays a readable size.

## Settings

| Key     | Type | Default                 | Description                                    |
|---------|------|--------------------------|-------------------------------------------------|
| `city1` | enum | `New York, United States` | First clock (required, no "None")              |
| `city2` | enum | `London, United Kingdom`  | Second clock (required, no "None")             |
| `city3` | enum | `Tokyo, Japan`             | Third clock, or "None" to show only 2 clocks   |
| `city4` | enum | `None`                     | Fourth clock, or "None" to show 2-3 clocks     |

## Install

\`\`\`sh
./install-addon.sh com.vardek.world-clocks
\`\`\`

See the [repo README](../README.md) for manual install and uninstall.

## Notes

Local time only — no network permissions. Timezones come from the
browser's own `Intl` API (DST-aware), same city list as the bundled
Weather widget.
```

- [ ] **Step 5: Add a row to `vardek-widgets/README.md`**

Add after the Nixie Clock row in the widgets table:

```
| [World Clocks](com.vardek.world-clocks/) | `com.vardek.world-clocks` | 8×2 / 4×2 | Newsroom-style wall of 2-4 analog clocks (white face, black hands, red sweep) with city labels and time-difference offsets. Local clock, no network. |
```

- [ ] **Step 6: Commit**

```bash
git add com.vardek.world-clocks/README.md com.vardek.world-clocks/world-clocks-8x2.png vardek-widgets/README.md com.vardek.world-clocks/index.html
git commit -m "World Clocks: responsive layout pass, README, screenshot"
```

Do not push — per standing project convention (confirmed across the
Nixie Clock work in this repo), public-repo pushes wait for explicit
user go-ahead.
