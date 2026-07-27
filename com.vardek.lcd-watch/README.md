# LCD Watch

A retro digital-watch clock in the style of the Casio F-91W — green-grey LCD,
seven-segment numerals with ghost segments, weekday + date, big HH:MM, ticking
seconds, and a blinking colon. Local clock only, no network.

![LCD Watch widget](lcdclock.png)

## Settings

| Key             | Type    | Default | Description                                   |
|-----------------|---------|---------|-----------------------------------------------|
| `use24Hour`     | boolean | `true`  | 24-hour clock (12-hour shows AM/PM)           |
| `blinkColon`    | boolean | `true`  | Colon blinks once per second                  |
| `backlight`     | boolean | `false` | Off = green-grey LCD; on = glowing teal panel |
| `ghostSegments` | boolean | `true`  | Show the faint unlit segments behind digits   |

## Install

```sh
./install-addon.sh com.vardek.lcd-watch
```

See the [repo README](../README.md) for manual install.
