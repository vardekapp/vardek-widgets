# Vardek Add-on Widgets

Community / add-on widgets for **[Vardek](https://vardek.app)** — the macOS
dashboard for the Corsair Xeneon Edge. Get the app first:
[vardekapp/Vardek](https://github.com/vardekapp/Vardek) · [vardek.app](https://vardek.app).

The Vardek app ships with a curated set of built-in widgets. This repo holds
**add-on widgets** you can install *after the fact* — no app update, no rebuild.
Vardek scans a user widgets directory alongside its bundled ones, so dropping a
widget folder in and rescanning is all it takes.

## Widgets

| Widget | id | Size | What it does |
|--------|----|------|--------------|
| [Air Quality](com.vardek.air-quality/) | `com.vardek.air-quality` | 8×2 / 4×2 | Radial gauge HUD for any city's air quality — hero US/EU AQI ring with up to 10 user-picked pollutant/pollen mini-gauges orbiting it on tone-colored spokes (Open-Meteo, keyless). |
| [CISA Known Exploited Vulnerabilities](com.vardek.cisa-kev/) | `com.vardek.cisa-kev` | 8×2 | Wire-bulletin feed of actively-exploited CVEs from CISA's KEV catalog — due-date urgency, ransomware-flagged RUSH stamps, tap a bulletin for its NVD record (CISA, keyless). |
| [Day/Night Map](com.vardek.day-night/) | `com.vardek.day-night` | 8×2 | World map with a live day/night terminator and UTC-offset time ticks. Pure client-side solar math, no network. |
| [Earthquake Monitor](com.vardek.earthquake/) | `com.vardek.earthquake` | 8×2 | World map of recent quakes, colored by magnitude — tap a quake for details (USGS, keyless). |
| [F1 Schedule](com.vardek.f1-schedule/) | `com.vardek.f1-schedule` | 8×2 | Formula 1 next race, standings, and calendar (Jolpica / OpenF1 / MotorsportCalendars, keyless). |
| [Flight Tracker](com.vardek.flight-tracker/) | `com.vardek.flight-tracker` | 8×2 | Tracks up to 4 flights, laid out to fill the panel by count — route with live progress, times, aircraft, live altitude/speed/heading (AeroDataBox, requires your own API key). |
| [ISS Tracker](com.vardek.iss/) | `com.vardek.iss` | 8×2 | Standalone world map with the ISS's live position, trail, and projected orbit — accurate SGP4 from a keyless TLE feed (wheretheiss.at). |
| [LCD Watch](com.vardek.lcd-watch/) | `com.vardek.lcd-watch` | 4×2 / 2×1 | Retro Casio F-91W–style digital clock — seven-segment time/date with ghost segments, blinking colon, backlight toggle. Local clock, no network. |
| [Life Progress](com.vardek.life-progress/) | `com.vardek.life-progress` | 8×2 / 4×2 | Horizontal progress bars — life, year, month, week, day. Pure client-side, no network. |
| [London Tube](com.vardek.london-tube/) | `com.vardek.london-tube` | 8×2 / 4×2 | Live London Underground/DLR/Elizabeth line arrivals and line status for a chosen station, with a walking-buffer offset and direction/line filters (TfL Unified API, keyless). |
| [Nixie Clock](com.vardek.nixie-clock/) | `com.vardek.nixie-clock` | 8×2 / 4×2 | Glowing nixie-tube-style clock (HH:MM:SS) with a tube-style date line, ghost-digit outlines, warm flicker, and a user-pickable glow color. Local clock, no network. |
| [On This Day](com.vardek.otd/) | `com.vardek.otd` | 8×2 | Gallery wall of Wikipedia's "on this day" history — 16-card paged grid of events, births, deaths, and holidays, category-toggled, tap any card to open its article (Wikipedia REST API, keyless). |
| [Picture of the Day](com.vardek.potd/) | `com.vardek.potd` | 8×2 | Darkroom contact-sheet frame for Wikipedia's daily featured photo — headline, photographer credit, license, and caption in a proof-sheet column, tap to open full resolution on Commons (Wikipedia REST API, keyless). |
| [Space Launch Schedule](com.vardek.space-launch/) | `com.vardek.space-launch` | 4×2 / 8×2 | Upcoming rocket launches with color-coded live countdowns (Launch Library 2, keyless). |
| [UniFi Network](com.vardek.unifi/) | `com.vardek.unifi` | 8×2 | Ubiquiti UniFi network stats from the UniFi Site Manager API (`api.ui.com`). Requires your own `UNIFI_KEY`. |
| [World Clocks](com.vardek.world-clocks/) | `com.vardek.world-clocks` | 8×2 / 4×2 | Newsroom-style wall of 2-4 analog clocks (white face, black hands, red sweep) with city labels and time-difference offsets. Local clock, no network. |

Screenshots live in each widget's own folder/README — click through above.

## Install

**Option A — script (easiest):**

```sh
git clone https://github.com/vardekapp/vardek-widgets
cd vardek-widgets
./install-addon.sh com.vardek.day-night
```

The script copies the folder to `~/Library/Application Support/Vardek/widgets/`
and rescans the running daemon. Then open Admin (`http://127.0.0.1:8137/admin`),
find the widget, and place it.

**Option B — manual:**

1. In Vardek Admin Widgets panel, click **Open Folder** — this opens
   `~/Library/Application Support/Vardek/widgets/` in Finder.
2. Copy the widget folder (e.g. `com.vardek.day-night/`) into it.
3. Click **Rescan**. The widget appears in the library — place it.

Either way: **no app reinstall, no restart.**

## Uninstall

Delete the widget folder from `~/Library/Application Support/Vardek/widgets/` and
click **Rescan** (or remove it from your layout in Admin first).

## Authoring your own

See [AUTHORING.md](AUTHORING.md) for the widget contract (manifest, settings,
sizes) and the runtime constraints. PRs adding new widgets are welcome.

## Trust & safety

Add-on widgets are HTML/JS that run in Vardek's sandboxed iframe (opaque origin,
CSP, network calls confined to a per-widget proxy allowlist). The sandbox limits
what a widget can do, but a widget can still use the capabilities it declares
(network hosts in its manifest, any secrets you grant it in Admin) — treat
installing one like installing a browser extension. Only install widgets whose
source you're comfortable with. Everything here is source-viewable — read before
you install.

## License

Widgets and tooling in this repo: [MIT](LICENSE). The Vardek app itself is a
separate, closed-source product.
