# Authoring a Vardek widget

A widget is a **folder** with a `manifest.json` and an entry HTML file. Vardek
serves the folder in a sandboxed iframe on the dashboard grid. That's it — no
build step, no framework.

## Folder layout

```
com.yourname.mywidget/
├── manifest.json     # required
├── index.html        # entry (name it whatever manifest.entry says)
├── ...               # any JS/CSS/assets, loaded with relative paths
└── README.md         # optional
```

Use a reverse-DNS id you control (`com.yourname.mywidget`). It must match the
folder name.

## manifest.json

```json
{
  "id": "com.yourname.mywidget",
  "name": "My Widget",
  "version": "1.0.0",
  "entry": "index.html",
  "subscriptions": [],
  "sizes": [ { "cols": 2, "rows": 1 }, { "cols": 4, "rows": 2 } ],
  "canvas": { "width": 640, "height": 320 },
  "settingsSchema": {
    "label":  { "type": "string",  "label": "Label",     "default": "Hello" },
    "big":    { "type": "boolean", "label": "Large text", "default": false },
    "mode":   { "type": "enum",    "label": "Mode", "default": "a", "values": ["a","b"] }
  }
}
```

| Field | Required | Notes |
|-------|----------|-------|
| `id` | yes | Reverse-DNS, equals folder name. Use your own prefix (e.g. `com.yourname.*`): `com.vardek.*` and `installation.*` are reserved and Vardek won't load them. Official add-ons use `app.vardek.*`. |
| `name` | yes | Shown in Admin. |
| `icon` | optional | An emoji shown as the widget's tile icon in Admin (e.g. `"🛰️"`). Omit for a neutral default. Bundled widgets' icons and emoji are reserved: an add-on can't reuse them (by id suffix or by copying the emoji); Admin ignores such an icon and shows a fallback. |
| `version` | yes | Semver string. |
| `entry` | yes | HTML file to load. |
| `sizes` | yes | Allowed footprints on the 8×2 grid. `cols` 1–8, `rows` 1–2. |
| `canvas` | optional | Logical px the entry renders at; scaled to the slot. |
| `subscriptions` | optional | Data channels (`sensors`, `config`). `[]` for none. There is no `media` channel (Now Playing was removed in 1.0.22). |
| `settingsSchema` | optional | User-editable settings; Admin builds a form from it. Types: `boolean`, `string`, `number`, `enum` (with `values`), `color` (native color picker, value is a `#rrggbb` hex string). |
| `permissions` | optional | `{ "proxy": ["https://api.example.com/**"], "secrets": ["MY_KEY"] }` — see Network below. |
| `refreshInterval` | optional | Seconds; fires an `onRefresh` tick. |

The grid is **8 columns × 2 rows**. Full panel = `{ "cols": 8, "rows": 2 }` at
canvas `2560 × 720` (the Xeneon Edge). Invalid manifests are skipped with a
reason in Admin — never fatal.

### Sizes in pixels

On the 2560 × 720 Xeneon Edge with the default 8 px gutter, a slot is this many
pixels (`Vardek.size` reports the real values at run time, and they change with
the display and the gutter):

| Span | Pixels | | Span | Pixels |
|------|--------|-|------|--------|
| 1×1 | 311 × 348 | | 1×2 | 311 × 704 |
| 2×1 | 630 × 348 | | 2×2 | 630 × 704 |
| 3×1 | 949 × 348 | | 3×2 | 949 × 704 |
| 4×1 | 1268 × 348 | | 4×2 | 1268 × 704 |
| 6×1 | 1906 × 348 | | 6×2 | 1906 × 704 |
| 8×1 | 2544 × 348 | | 8×2 | 2544 × 704 |

Porting from iCUE: Corsair documents Xeneon Edge slots from Small
(840 × 344) to Extra Large (2536 × 696). The closest Vardek spans are **3×1**
for Small and **8×2** for Extra Large. Corsair publishes the sizes in between
in [its widget docs](https://docs.elgato.com/icue/widgets/); match each to the
nearest span from the table. Write widgets responsively (percentages, flex or
grid, `Vardek.onResize`) rather than for one fixed size.

## Runtime bridge

Vardek injects a bridge script at serve time. In your entry file:

```html
<script>
  const defaults = { label: "Hello", big: false };
  let cfg = defaults;

  document.addEventListener("vardek:ready", () => {
    cfg = Object.assign({}, defaults, Vardek.settings);  // merge user settings
    render();
  });
  render();  // draw immediately too; re-draw on ready with real settings
</script>
```

Bridge surface (`Vardek` global): `Vardek.settings`, `Vardek.size`,
`Vardek.subscribe(channel, cb)`, `Vardek.onResize(cb)`, and
`Vardek.escapeHtml(str)` (escape text before inserting it as HTML). The
`vardek:ready` event fires once the bridge is live. `Vardek.sendCommand` is a
deprecated no-op since 1.0.22 (no channel accepts commands); don't rely on it.

## HARD CONSTRAINT — no ES modules

Widgets run in a `sandbox="allow-scripts"` iframe → **opaque origin**. An
external `<script type="module" src="...">` is fetched in CORS mode and the
daemon does not send CORS headers on widget assets, so it is **blocked** and your
widget renders blank. Use **classic** scripts:

```html
<script src="helpers.js"></script>   <!-- sets globals -->
<script>  /* uses those globals */ </script>
```

Classic scripts run in document order, so a later `<script>` sees globals set by
earlier ones. Expose shared helpers on `globalThis`. (Inline `<script>` is fine;
just avoid `type="module"`.)

## Network

No ambient network. To fetch, declare hosts in `permissions.proxy` (glob
allowlist) and call through the injected proxy; requests to other hosts are
blocked. API keys go in `permissions.secrets` — the user enters them in Admin,
they're stored in the Keychain, and injected server-side (never exposed to
widget JS). A CSP restricts the widget document. Keep allowlists tight.

**Gotcha: the API host and its CDN host can be different domains.** The
widget document's CSP (`img-src`/`connect-src`/…) is derived straight from
`permissions.proxy`, so *every* host your widget's markup loads from must be
listed — not just the one you call for JSON. Picture of the Day calls
`*.wikipedia.org` for data but its images are served from
`upload.wikimedia.org` (`wikipedia.org` vs `wikimedia.org` — easy to miss).
Forgetting the second host doesn't error on the fetch; the `<img>` just gets
silently blocked by CSP, which looks exactly like a network/proxy failure.
Check every host your rendered HTML actually loads from (fonts, images,
iframes), not just the ones your JS calls directly.

## Quality bar

A widget is read at a glance from across a desk, on a touchscreen that may be
off-screen on another page. Before you open a PR:

- **Glanceable.** One main reading or idea, large type, nothing that needs
  squinting. Test at the smallest size you declare.
- **Every state is designed.** Draw the loading state, the error state (say what
  failed and what to do) and the offline or "no data yet" state. A blank widget is
  a bug. If a required key is unset, the proxy answers 412 `secret not set`;
  show a clear "enter your key" message instead of a generic error.
- **Responsive.** Fill the slot at every size in `sizes`. Either declare a
  `canvas` (Vardek scales it to the slot) or re-layout in `Vardek.onResize`. Don't
  hard-code pixel sizes that assume one slot.
- **Touch-sized.** Targets of at least about 44 px. The touch driver sends one
  finger only, so don't rely on pinch, two-finger scroll or hover.
- **Cheap when hidden.** Stop timers and polling when you don't need them;
  widgets on other pages are throttled.
- **Tested on the panel.** Run it on a real Xeneon Edge, or in a 2560 × 720
  window, at each declared size, not just in a browser tab.
- **Honest permissions.** Declare only the hosts your markup and JS load from
  (including image and font hosts) and only the secrets you read.

## Test locally

```sh
./install-addon.sh com.yourname.mywidget   # copy to user dir, then Rescan in Admin → Widgets
```

Edit files, re-run to reinstall, then reload the widget in Admin (toggle it off/on
or refresh the dashboard) to repaint. After editing a widget already installed,
click **Rescan** in Admin → Widgets to pick up manifest changes, then approve it
again (changed files or permissions need a fresh approval).

## Contributing

Open a PR adding your `com.yourname.widget/` folder and a row in the README table.
Keep widgets self-contained and dependency-free where possible.
