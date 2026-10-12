# Instructions for AI coding agents

This repo holds add-on widgets for **Vardek**, a Mac dashboard for the Corsair
Xeneon Edge. If you are asked to write or change a widget here, read
[`AUTHORING.md`](AUTHORING.md) first. It is the source of truth for the manifest,
the runtime bridge, sizes and the quality bar. Look at a similar widget in this
repo before writing a new one, and copy its structure.

## A widget is a folder

`app.vardek.<name>/` (official) or `com.<you>.<name>/` (yours) containing
`manifest.json`, an entry HTML file and any assets. The `id` in the manifest must
equal the folder name. No build step, no framework, no dependencies.

## Rules that break widgets if you ignore them

- **Classic scripts only.** No `type="module"` and no `import`/`export`. Widgets run
  in an opaque-origin sandbox and module scripts are blocked, leaving a blank widget.
- **IDs:** ASCII letters, digits, `_`, `.`, `-`; 1–128 characters; not `.` or `..`;
  no leading `.`. `com.vardek.*` and `installation.*` are reserved in any
  capitalisation. A `permissions.secrets` key uses only letters, digits and `_`.
- **No ambient network.** Declare every host the widget loads from in
  `permissions.proxy`, including image, font and CDN hosts, not just the JSON API.
  A missing host fails silently as a blocked request.
- **Never put secrets in widget code.** Declare the key in `permissions.secrets`;
  the user enters it in Admin and Vardek injects it server-side. An unset key makes
  the proxy answer 412, so show an "enter your key" state.
- **Escape untrusted text** with `Vardek.escapeHtml()` before inserting it as HTML.
- **No persistence and no audio.** State resets on reload and widgets cannot play
  sound. Design for it; do not work around it.
- **Touch is single-finger.** No pinch, hover or two-finger gestures.
- **Grid:** 8 columns × 2 rows, full panel is 2560 × 720. Declare only the sizes
  you have tested, and either declare a `canvas` (scaled to the slot) or re-layout
  on `Vardek.onResize`.

## Before you say it is done

1. Draw the loading, error and offline states, and check each declared size.
2. Walk the "Quality bar" list in `AUTHORING.md`.
3. Run `node validate.mjs --strict <folder>` and fix everything it reports. It
   enforces the same id, secret-key and proxy rules as the app.
4. Install it with `./install-addon.sh <folder-name>`, **Rescan** in Admin →
   Widgets, approve it, and look at it. A widget that has only been read, not run,
   is not finished.
5. Do not add runtime dependencies, build steps or network calls to the app side;
   this repo only contains widgets.

## Git

This repo belongs to the `vardekapp` account and is public. Do not commit local
paths, keys, hostnames or personal data.
