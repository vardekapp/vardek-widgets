# Space Launch Schedule

A list of upcoming rocket launches with live countdowns, via
[Launch Library 2](https://thespacedevs.com/llapi) (thespacedevs.com, keyless).

Default size is **4×2** (half-panel); expandable to **8×2**.

- **Rows**: mission name (with a rocket glyph and a per-row colored accent
  bar), provider + pad, and a live countdown to NET (No Earlier Than) liftoff.
  Long names/providers truncate with an ellipsis.
- **Countdown** ticks locally every second (`Td HH:MM:SS`, or `HH:MM:SS` inside
  the final day); shows `LIFTOFF` once the window opens. Color-coded by
  urgency: muted blue (>24h), amber (1–24h), red (<1h), green (`LIFTOFF`).
- Data refreshes **hourly** to respect the Launch Library 2 free-tier rate
  limit; changing the launch count re-fetches immediately since it changes the
  query.

## Settings

| Key     | Type | Default | Description        |
|---------|------|---------|---------------------|
| `count` | enum | `8`     | Launches shown (5/8/12) |

Note: like other Vardek carousel widgets, this widget's refresh is paused
while its page is off-screen in the carousel and resumes when it becomes
visible again.

## Install

```sh
./install-addon.sh com.vardek.space-launch
```

See the [repo README](../README.md) for manual install and uninstall.

## Data

Live upcoming launch schedule from the
[Launch Library 2 API](https://ll.thespacedevs.com/2.2.0/launch/upcoming/)
(public, no key required, free-tier rate limited).
