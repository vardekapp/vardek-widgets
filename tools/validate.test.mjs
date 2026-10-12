import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { isReservedId, isSecretKey, isWidgetId, proxyOrigin, validateWidget } from "../validate.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const rules = JSON.parse(fs.readFileSync(path.join(here, "widget-rules.json"), "utf8"));
const expand = (c) => (c.repeat !== undefined ? c.repeat.repeat(c.count) : c.value);

// ---- the cases shared with the Swift tests (Tests/Fixtures/widget-rules.json in vardek-app) ----

test("identifier cases match the shared fixture", () => {
  assert.ok(rules.identifier.length > 0);
  for (const c of rules.identifier) {
    const fn = c.kind === "widgetID" ? isWidgetId : isSecretKey;
    assert.equal(fn(expand(c)), c.valid, `${c.kind} ${JSON.stringify(expand(c))}`);
  }
});

test("reserved-prefix cases match the shared fixture", () => {
  for (const c of rules.reserved) assert.equal(isReservedId(c.value), c.reserved, c.value);
});

test("proxy permission cases match the shared fixture", () => {
  for (const c of rules.proxy) assert.equal(proxyOrigin(c.value) !== null, c.valid, c.value);
});

// ---- whole-folder checks ----

const GOOD = {
  id: "com.example.demo", name: "Demo", version: "1.0.0", entry: "index.html",
  sizes: [{ cols: 2, rows: 1 }], canvas: { width: 640, height: 320 },
};

function widget(manifest, files = { "index.html": "<!doctype html><p>hi</p>" }, name) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "vw-"));
  const dir = path.join(root, name ?? (manifest && manifest.id) ?? "x");
  fs.mkdirSync(dir);
  if (manifest !== null) fs.writeFileSync(path.join(dir, "manifest.json"), typeof manifest === "string" ? manifest : JSON.stringify(manifest));
  for (const [rel, body] of Object.entries(files)) {
    fs.mkdirSync(path.dirname(path.join(dir, rel)), { recursive: true });
    fs.writeFileSync(path.join(dir, rel), body);
  }
  return dir;
}
const errs = (dir) => validateWidget(dir).errors.join("\n");
const warns = (dir) => validateWidget(dir).warnings.join("\n");

test("a minimal widget is clean", () => {
  const r = validateWidget(widget(GOOD));
  assert.deepEqual(r.errors, []);
  assert.deepEqual(r.warnings, []);
});

test("manifest problems are errors", () => {
  assert.match(errs(widget(null, { "index.html": "x" }, "x")), /manifest\.json is missing/);
  assert.match(errs(widget("{nope", { "index.html": "x" }, "x")), /not valid JSON/);
  assert.match(errs(widget("[]", { "index.html": "x" }, "x")), /must be a JSON object/);
  assert.match(errs(widget({ ...GOOD, id: ".hidden" }, undefined, ".hidden")), /id must be/);
  assert.match(errs(widget({ ...GOOD, id: "a\n" }, undefined, "a")), /id must be/);
  assert.match(errs(widget(GOOD, undefined, "other.name")), /must equal the manifest id/);
  assert.match(errs(widget({ ...GOOD, id: "Com.Vardek.mine" })), /reserved/);
  assert.match(errs(widget({ ...GOOD, name: "" })), /name is required/);
  assert.match(errs(widget({ ...GOOD, version: undefined })), /version is required/);
  assert.match(errs(widget({ ...GOOD, sizes: [] })), /sizes must list/);
  assert.match(errs(widget({ ...GOOD, sizes: [{ cols: 9, rows: 1 }] })), /cols 1-8/);
  assert.match(errs(widget({ ...GOOD, sizes: [{ cols: 1, rows: 3 }] })), /rows 1-2/);
  assert.match(errs(widget({ ...GOOD, canvas: { width: 0, height: 5 } })), /canvas/);
  assert.match(errs(widget({ ...GOOD, refreshInterval: 0 })), /refreshInterval/);
  assert.match(errs(widget({ ...GOOD, compat: "other" })), /compat/);
});

test("entry must be a relative html file that exists", () => {
  assert.match(errs(widget({ ...GOOD, entry: "../x.html" })), /relative path/);
  assert.match(errs(widget({ ...GOOD, entry: "/etc/x.html" })), /relative path/);
  assert.match(errs(widget({ ...GOOD, entry: "a?b.html" })), /relative path/);
  assert.match(errs(widget({ ...GOOD, entry: "index.js" }, { "index.js": "1" })), /HTML document/);
  assert.match(errs(widget({ ...GOOD, entry: "gone.html" })), /does not exist/);
});

test("permissions are checked with the app's rules", () => {
  assert.match(errs(widget({ ...GOOD, permissions: { proxy: ["http://api.example.com/**"] } })), /https origin/);
  assert.match(errs(widget({ ...GOOD, permissions: { proxy: ["https://exa mple.com"] } })), /https origin/);
  assert.match(errs(widget({ ...GOOD, permissions: { secrets: ["bad-key"] } })), /A-Z a-z 0-9 _/);
  const ok = validateWidget(widget({ ...GOOD, permissions: { proxy: ["https://api.example.com/**"], secrets: ["MY_KEY"] } },
    { "index.html": "<p>error: offline</p><script>fetch('https://api.example.com/x', {headers:{k:'{{secret:MY_KEY}}'}})</script>" }));
  assert.deepEqual(ok.errors, []);
});

test("settingsSchema fields are checked", () => {
  const bad = (schema) => errs(widget({ ...GOOD, settingsSchema: schema }));
  assert.match(bad({ a: { type: "wat" } }), /must be one of/);
  assert.match(bad({ a: { type: "boolean", default: "yes", label: "A" } }), /true or false/);
  assert.match(bad({ a: { type: "enum", values: ["x"], default: "y", label: "A" } }), /not one of its values/);
  assert.match(bad({ a: { type: "enum", label: "A" } }), /values must list/);
  assert.match(bad({ a: { type: "color", default: "red", label: "A" } }), /#rrggbb/);
  assert.match(bad({ "bad-key": { type: "secret", label: "K" } }), /secret field's name/);
  assert.match(warns(widget({ ...GOOD, settingsSchema: { KEY: { type: "secret", label: "K" } } })), /not in permissions\.secrets/);
});

test("the sandbox rules: external module scripts are errors, inline ones are fine", () => {
  assert.match(errs(widget(GOOD, { "index.html": '<script type="module" src="app.js"></script>' })), /type="module" src/);
  assert.deepEqual(validateWidget(widget(GOOD, { "index.html": '<script type="module">const a = 1;</script>' })).errors, []);
});

test("runtime hazards are warnings", () => {
  assert.match(warns(widget(GOOD, { "index.html": "<script>localStorage.x = 1</script>" })), /no persistence/);
  assert.match(warns(widget(GOOD, { "index.html": "<script>new Audio('a.mp3')</script>" })), /cannot play sound/);
  assert.match(warns(widget(GOOD, { "index.html": "<script>eval('1')</script>" })), /CSP blocks/);
  assert.match(warns(widget({ ...GOOD, subscriptions: ["media"] })), /not a known channel/);
  assert.match(warns(widget({ ...GOOD, bogus: 1 })), /unknown manifest field/);
  assert.match(warns(widget(GOOD, { "index.html": "x", "helper.js": "export const a = 1;\n" })), /ES module syntax/);
});

test("hosts the markup loads from must be in permissions.proxy", () => {
  const m = { ...GOOD, permissions: { proxy: ["https://api.example.com/**", "https://*.cdn.example.net/**"] } };
  const page = (body) => widget(m, { "index.html": `<p>error</p>${body}` });
  assert.match(warns(page('<img src="https://img.example.org/a.png">')), /img\.example\.org/);
  assert.equal(warns(page('<img src="https://api.example.com/a.png">')), "");
  assert.equal(warns(page('<img src="https://x.cdn.example.net/a.png">')), "");
  assert.equal(warns(page('<a href="https://elsewhere.example.org">link</a>')), "", "plain links are not loads");
  assert.match(warns(widget({ ...GOOD, permissions: { proxy: ["https://api.example.com/**"] } }, { "index.html": "<p>hi</p>" })), /no error\/offline state/);
});

test("links, hard links and stray files are caught", () => {
  const dir = widget(GOOD, { "index.html": "x", ".DS_Store": "junk" });
  fs.symlinkSync("/etc/hosts", path.join(dir, "link.txt"));
  fs.linkSync(path.join(dir, "index.html"), path.join(dir, "twin.html"));
  const r = validateWidget(dir);
  assert.match(r.errors.join("\n"), /link\.txt: symbolic links/);
  assert.match(r.errors.join("\n"), /hard links/);
  assert.match(r.warnings.join("\n"), /\.DS_Store/);
  assert.match(errs(path.join(dir, "missing")), /no such folder/);
});

test("CLI exit status: errors fail, warnings fail only with --strict", () => {
  const run = (...args) => spawnSync(process.execPath, [path.join(here, "..", "validate.mjs"), ...args], { encoding: "utf8" });
  const good = widget(GOOD);
  const warnOnly = widget(GOOD, { "index.html": "<script>localStorage.x=1</script>" });
  const bad = widget({ ...GOOD, sizes: [] });
  assert.equal(run(good).status, 0);
  assert.equal(run(warnOnly).status, 0);
  assert.equal(run("--strict", warnOnly).status, 1);
  assert.equal(run(bad).status, 1);
  assert.equal(run().status, 2);
});
