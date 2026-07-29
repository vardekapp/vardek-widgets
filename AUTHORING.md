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
| `id` | yes | Reverse-DNS, equals folder name. |
| `name` | yes | Shown in Admin. |
| `icon` | optional | An emoji shown as the widget's tile icon in Admin (e.g. `"🛰️"`). Omit for a neutral default. |
| `version` | yes | Semver string. |
| `entry` | yes | HTML file to load. |
| `sizes` | yes | Allowed footprints on the 8×2 grid. `cols` 1–8, `rows` 1–2. |
| `canvas` | optional | Logical px the entry renders at; scaled to the slot. |
| `subscriptions` | optional | Data channels (`sensors`, `config`, …). `[]` for none. |
| `settingsSchema` | optional | User-editable settings; Admin builds a form from it. Types: `boolean`, `string`, `number`, `enum` (with `values`). |
| `permissions` | optional | `{ "proxy": ["https://api.example.com/**"], "secrets": ["MY_KEY"] }` — see Network below. |
| `refreshInterval` | optional | Seconds; fires an `onRefresh` tick. |

The grid is **8 columns × 2 rows**. Full panel = `{ "cols": 8, "rows": 2 }` at
canvas `2560 × 720` (the Xeneon Edge). Invalid manifests are skipped with a
reason in Admin — never fatal.

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
`Vardek.subscribe(channel, cb)`, `Vardek.sendCommand(channel, payload)`,
`Vardek.onResize(cb)`. The `vardek:ready` event fires once the bridge is live.

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

## Test locally

```sh
./install-addon.sh com.yourname.mywidget   # copy to user dir + rescan
```

Edit files, re-run to reinstall, then reload the widget in Admin (toggle it off/on
or refresh the dashboard) to repaint. After editing a widget already installed,
the daemon needs a **rescan** to pick up manifest changes.

## Contributing

Open a PR adding your `com.yourname.widget/` folder and a row in the README table.
Keep widgets self-contained and dependency-free where possible.
