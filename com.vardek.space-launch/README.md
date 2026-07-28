# Space Launch Schedule

A list of upcoming rocket launches with live countdowns, via
[Launch Library 2](https://thespacedevs.com/llapi) (thespacedevs.com, keyless).

- **Rows**: mission name, provider + pad, and a live countdown to NET (No
  Earlier Than) liftoff.
- **Countdown** ticks locally every second (`Td HH:MM:SS`, or `HH:MM:SS` inside
  the final day); shows `LIFTOFF` once the window opens.
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
