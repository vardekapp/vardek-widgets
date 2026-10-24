#!/usr/bin/env node
// Check a Vardek widget folder before you submit it or install it.
//
//   node validate.mjs app.vardek.iss            # one folder
//   node validate.mjs app.vardek.*              # several
//   node validate.mjs --strict my.widget        # warnings fail too
//
// Errors are things Vardek refuses to load (or the docs require); warnings are things that
// usually break a widget at run time. Exit status 1 when any error was found (or any warning
// with --strict). No dependencies; Node 18+.
//
// The id / secret-key / proxy rules are ports of the Swift rules in the app. tools/ has tests
// that run the shared cases in widget-rules.json against both, so they cannot drift silently.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const MAX_ID = 128;
const MAX_FILES = 1024;
const MAX_FILE_BYTES = 10 * 1024 * 1024;
const MAX_TOTAL_BYTES = 50 * 1024 * 1024;
const MAX_DEPTH = 64;
const FIELD_TYPES = ["boolean", "string", "number", "enum", "color", "secret", "actions"];
const KNOWN_KEYS = ["id", "name", "version", "entry", "icon", "subscriptions", "sizes", "canvas",
  "settingsSchema", "permissions", "refreshInterval", "compat"];

// ---- shared rules (ports of Sources/VardekIPC/Identifier.swift and ProxyPermission.swift) ----

export function isWidgetId(value) {
  const chars = [...value];
  if (chars.length < 1 || chars.length > MAX_ID) return false;
  if (!/^[A-Za-z0-9_.-]+$/.test(value)) return false;   // JS `$` is strict: no trailing-newline hole
  return value !== "." && value !== ".." && chars[0] !== ".";
}

export function isSecretKey(value) {
  const length = [...value].length;
  return length >= 1 && length <= MAX_ID && /^[A-Za-z0-9_]+$/.test(value);
}

/** com.vardek.* belongs to bundled widgets; installation.* prefixes secret namespaces. */
export function isReservedId(value) {
  const folded = value.toLowerCase();
  return folded.startsWith("com.vardek.") || folded.startsWith("installation.");
}

/** The origin a proxy permission names (`https://host[:port]`), or null if Vardek would refuse it. */
export function proxyOrigin(pattern) {
  if (!pattern.startsWith("https://")) return null;
  for (const ch of pattern) {
    const code = ch.codePointAt(0);
    if (code < 33 || code > 126) return null;
  }
  if (/[\\;#"'<>]/.test(pattern)) return null;
  const rest = pattern.slice(8);
  const slash = rest.indexOf("/");
  const authority = slash < 0 ? rest : rest.slice(0, slash);
  if (!authority) return null;
  // Names only: an IP literal, a single-label or local-only name, or a wildcard over a whole TLD
  // would reach CSP connect-src and let the widget bypass the proxy's SSRF checks.
  if (authority.startsWith("[")) return null;
  const parts = authority.split(":");
  if (parts.length > 2) return null;
  const port = parts.length === 2 ? parts[1] : null;
  const host = parts[0];
  const domain = host.startsWith("*.") ? host.slice(2) : host;
  const labels = domain.split(".");
  const ok = domain.length <= 253 && labels.length >= 2 && labels.every((label) =>
    label.length > 0 && label.length <= 63 && /^[A-Za-z0-9]/.test(label)
    && /[A-Za-z0-9]$/.test(label) && /^[A-Za-z0-9-]+$/.test(label));
  if (!ok) return null;
  const tld = labels[labels.length - 1].toLowerCase();
  if (/^[0-9]+$/.test(tld) || tld === "local" || tld === "localhost") return null;
  if (port !== null) {
    if (!/^[0-9]+$/.test(port)) return null;
    const n = Number(port);
    if (n < 1 || n > 65535) return null;
  }
  return `https://${authority}`;
}

// ---- the checks ----

const isInt = (v) => Number.isInteger(v);

/** Collect every file under `dir` without following links; push errors for what Vardek rejects. */
function scanFiles(dir, errors, warnings) {
  const files = [];
  let total = 0;
  let overflow = false;
  const walk = (current, depth) => {
    if (depth > MAX_DEPTH) { errors.push(`directories nest deeper than ${MAX_DEPTH} levels`); return; }
    for (const name of fs.readdirSync(current)) {
      const full = path.join(current, name);
      const rel = path.relative(dir, full);
      const st = fs.lstatSync(full);
      if (st.isSymbolicLink()) { errors.push(`${rel}: symbolic links are not allowed`); continue; }
      if (st.isDirectory()) { walk(full, depth + 1); continue; }
      if (!st.isFile()) { errors.push(`${rel}: only regular files are allowed`); continue; }
      if (name === ".DS_Store") { warnings.push(`${rel}: stray file, delete it`); continue; }
      if (st.nlink > 1) errors.push(`${rel}: hard links are not allowed`);
      if (st.size > MAX_FILE_BYTES) errors.push(`${rel}: larger than 10 MiB`);
      total += st.size;
      files.push({ rel, full, size: st.size });
      if (files.length > MAX_FILES && !overflow) { overflow = true; errors.push(`more than ${MAX_FILES} files`); }
    }
  };
  walk(dir, 0);
  if (total > MAX_TOTAL_BYTES) errors.push("widget is larger than 50 MiB in total");
  return files;
}

function checkManifest(m, folderName, errors, warnings) {
  if (typeof m.id !== "string" || !isWidgetId(m.id)) {
    errors.push("id must be 1-128 ASCII characters of A-Z a-z 0-9 _ . - and must not start with '.'");
  } else {
    if (isReservedId(m.id)) errors.push("ids starting com.vardek. or installation. are reserved (any capitalisation)");
    if (m.id !== folderName) errors.push(`folder name "${folderName}" must equal the manifest id "${m.id}"`);
  }
  if (typeof m.name !== "string" || !m.name.trim()) errors.push("name is required");
  if (typeof m.version !== "string") errors.push("version is required (a semver string)");
  else if (!/^\d+\.\d+\.\d+/.test(m.version)) warnings.push(`version "${m.version}" is not semver`);
  for (const key of Object.keys(m)) {
    if (!KNOWN_KEYS.includes(key)) warnings.push(`unknown manifest field "${key}" (Vardek ignores it)`);
  }

  if (!Array.isArray(m.sizes) || m.sizes.length === 0) {
    errors.push("sizes must list at least one { cols, rows }");
  } else {
    for (const s of m.sizes) {
      if (!s || !isInt(s.cols) || !isInt(s.rows) || s.cols < 1 || s.cols > 8 || s.rows < 1 || s.rows > 2) {
        errors.push(`size ${JSON.stringify(s)} must have cols 1-8 and rows 1-2`);
      }
    }
  }
  if (m.canvas !== undefined) {
    const c = m.canvas;
    if (!c || !isInt(c.width) || !isInt(c.height) || c.width < 1 || c.height < 1) errors.push("canvas needs positive integer width and height");
  }
  if (m.refreshInterval !== undefined && (!isInt(m.refreshInterval) || m.refreshInterval < 1)) {
    errors.push("refreshInterval must be a positive whole number of seconds");
  }
  if (m.compat !== undefined && m.compat !== "icue") errors.push('compat can only be "icue"');
  if (m.icon !== undefined && typeof m.icon !== "string") errors.push("icon must be a string (an emoji)");
  if (m.subscriptions !== undefined) {
    if (!Array.isArray(m.subscriptions) || m.subscriptions.some((s) => typeof s !== "string")) {
      errors.push("subscriptions must be an array of channel names");
    } else {
      for (const s of m.subscriptions) {
        if (!["sensors", "config"].includes(s)) warnings.push(`subscription "${s}" is not a known channel (sensors, config)`);
      }
    }
  }

  const perms = m.permissions ?? {};
  const proxy = perms.proxy ?? [];
  const secrets = perms.secrets ?? [];
  if (!Array.isArray(proxy) || proxy.some((p) => typeof p !== "string")) errors.push("permissions.proxy must be an array of strings");
  else for (const p of proxy) if (proxyOrigin(p) === null) errors.push(`permissions.proxy "${p}" must be an https origin (valid host, optional port and path glob)`);
  if (!Array.isArray(secrets) || secrets.some((s) => typeof s !== "string")) errors.push("permissions.secrets must be an array of strings");
  else for (const s of secrets) if (!isSecretKey(s)) errors.push(`permissions.secrets "${s}" may use only A-Z a-z 0-9 _ (1-128 characters)`);

  if (m.settingsSchema !== undefined) {
    if (!m.settingsSchema || typeof m.settingsSchema !== "object" || Array.isArray(m.settingsSchema)) {
      errors.push("settingsSchema must be an object");
    } else {
      for (const [key, f] of Object.entries(m.settingsSchema)) checkField(key, f, secrets, errors, warnings);
    }
  }
  return { proxy: Array.isArray(proxy) ? proxy : [], secrets: Array.isArray(secrets) ? secrets : [] };
}

function checkField(key, f, secrets, errors, warnings) {
  const at = `settingsSchema.${key}`;
  if (!f || typeof f !== "object" || Array.isArray(f)) { errors.push(`${at} must be an object`); return; }
  if (!FIELD_TYPES.includes(f.type)) { errors.push(`${at}.type "${f.type}" must be one of ${FIELD_TYPES.join(", ")}`); return; }
  if (typeof f.label !== "string" || !f.label) warnings.push(`${at} has no label`);
  const has = f.default !== undefined;
  if (f.type === "boolean" && has && typeof f.default !== "boolean") errors.push(`${at}.default must be true or false`);
  if (f.type === "number" && has && typeof f.default !== "number") errors.push(`${at}.default must be a number`);
  if (f.type === "string" && has && typeof f.default !== "string") errors.push(`${at}.default must be a string`);
  if (f.type === "color" && has && !(typeof f.default === "string" && /^#[0-9a-fA-F]{6}$/.test(f.default))) errors.push(`${at}.default must be a #rrggbb colour`);
  if (f.type === "enum") {
    if (!Array.isArray(f.values) || f.values.length === 0 || f.values.some((v) => typeof v !== "string")) errors.push(`${at}.values must list the allowed strings`);
    else if (has && !f.values.includes(f.default)) errors.push(`${at}.default "${f.default}" is not one of its values`);
  }
  if (f.type === "secret") {
    if (!isSecretKey(key)) errors.push(`${at}: a secret field's name is the key, so it may use only A-Z a-z 0-9 _`);
    else if (!secrets.includes(key)) warnings.push(`${at} is a secret but ${key} is not in permissions.secrets`);
  }
}

const TEXT = /\.(html?|js|mjs|css)$/i;

function checkContent(manifestInfo, manifest, dir, files, errors, warnings) {
  // entry
  const entry = typeof manifest.entry === "string" ? manifest.entry : null;
  if (entry === null) {
    errors.push("entry is required (the HTML file to load)");
  } else {
    const parts = entry.split("/").filter((p) => p !== ".");
    if (entry.startsWith("/") || parts.length === 0 || parts.includes("..") || /[%?#\\:]/.test(entry) || /[\u0000-\u001f\u007f]/.test(entry)) {
      errors.push("entry must be a relative path inside the widget folder");
    } else if (!/\.html?$/i.test(entry)) {
      errors.push("entry must be an HTML document (.html or .htm)");
    } else if (!files.some((f) => f.rel === parts.join("/"))) {
      errors.push(`entry "${entry}" does not exist in the folder`);
    }
  }

  // Scan our own text files (skip minified bundles and big files: they are not authored here).
  const authored = files.filter((f) => TEXT.test(f.rel) && !/\.min\.[a-z]+$/i.test(f.rel)
    && !/\.test\.[a-z]+$/i.test(f.rel) && f.size <= 2 * 1024 * 1024);
  let text = "";
  for (const f of authored) {
    const body = fs.readFileSync(f.full, "utf8");
    text += `\n${body}`;
    // An external module script is fetched in CORS mode and blocked; an inline one needs no fetch.
    for (const tag of body.match(/<script\b[^>]*>/gi) ?? []) {
      if (/\btype\s*=\s*["']?module/i.test(tag) && /\bsrc\s*=/i.test(tag)) {
        errors.push(`${f.rel}: <script type="module" src=...> is blocked in the widget sandbox, use a classic script`);
      }
    }
    if (/\.m?js$/i.test(f.rel) && /^\s*(import\s[^('"]*\sfrom\s|import\s*['"]|export\s)/m.test(body)) {
      warnings.push(`${f.rel}: ES module syntax (import/export) will not run in a classic script`);
    }
  }

  // Hosts the markup/JS loads from must be listed, or the CSP blocks them silently.
  const allowed = manifestInfo.proxy.map(proxyOrigin).filter(Boolean).map((o) => o.slice(8).replace(/:\d+$/, ""));
  const covered = (host) => allowed.some((a) => a === host || (a.startsWith("*.") && (host === a.slice(2) || host.endsWith(a.slice(1)))));
  const seen = new Set();
  // Only places that load something (src=, url(), fetch(), @import); plain links are not blocked.
  for (const m of text.matchAll(/(?:\bsrc\s*=\s*|url\(\s*|fetch\(\s*|@import\s+)["'`]?https:\/\/([A-Za-z0-9][A-Za-z0-9.-]*)/g)) {
    const host = m[1].toLowerCase().replace(/\.$/, "");
    if (seen.has(host)) continue;
    seen.add(host);
    if (host === "www.w3.org" || covered(host)) continue;
    warnings.push(`loads from ${host}, which is not in permissions.proxy (blocked unless listed)`);
  }
  if (/\bhttp:\/\/(?!www\.w3\.org|localhost|127\.0\.0\.1)[A-Za-z0-9]/.test(text)) warnings.push("uses an http:// URL; only https hosts can be reached");

  // Things the runtime does not support.
  if (/\b(localStorage|sessionStorage|indexedDB)\b/.test(text)) warnings.push("uses browser storage; widgets have no persistence, state resets on reload");
  if (/new Audio\(|<audio\b|AudioContext/.test(text)) warnings.push("uses audio; widgets cannot play sound");
  if (/\beval\(|new Function\(/.test(text)) warnings.push("uses eval/new Function; the widget CSP blocks it");

  // Quality bar.
  if (manifestInfo.proxy.length > 0 && !/error|offline|unavailable|unreachable|failed|no data|secret not set|enter your key/i.test(text)) {
    warnings.push("fetches data but no error/offline state text was found; design what the user sees when it fails");
  }
  for (const key of manifestInfo.secrets) {
    if (!text.includes(key)) warnings.push(`secret ${key} is declared but never referenced`);
  }
}

/** Validate one widget folder. Returns { errors, warnings, id }. Never throws for bad widgets. */
export function validateWidget(folder) {
  const errors = [];
  const warnings = [];
  const dir = path.resolve(folder);
  const folderName = path.basename(dir);
  let st;
  try { st = fs.lstatSync(dir); } catch { return { errors: [`${folder}: no such folder`], warnings, id: folderName }; }
  if (st.isSymbolicLink() || !st.isDirectory()) return { errors: [`${folder}: must be a plain folder`], warnings, id: folderName };

  const files = scanFiles(dir, errors, warnings);
  const manifestFile = path.join(dir, "manifest.json");
  if (!files.some((f) => f.rel === "manifest.json")) {
    errors.push("manifest.json is missing");
    return { errors, warnings, id: folderName };
  }
  let manifest;
  try { manifest = JSON.parse(fs.readFileSync(manifestFile, "utf8")); }
  catch (e) { errors.push(`manifest.json is not valid JSON: ${e.message}`); return { errors, warnings, id: folderName }; }
  if (!manifest || typeof manifest !== "object" || Array.isArray(manifest)) {
    errors.push("manifest.json must be a JSON object");
    return { errors, warnings, id: folderName };
  }
  const info = checkManifest(manifest, folderName, errors, warnings);
  checkContent(info, manifest, dir, files, errors, warnings);
  return { errors, warnings, id: typeof manifest.id === "string" ? manifest.id : folderName };
}

// ---- CLI ----

function main(argv) {
  const strict = argv.includes("--strict");
  const folders = argv.filter((a) => !a.startsWith("--"));
  if (folders.length === 0 || argv.includes("--help")) {
    console.error("usage: node validate.mjs [--strict] <widget-folder>...");
    return folders.length === 0 && !argv.includes("--help") ? 2 : 0;
  }
  let failed = 0;
  for (const folder of folders) {
    const { errors, warnings, id } = validateWidget(folder);
    const bad = errors.length > 0 || (strict && warnings.length > 0);
    console.log(`${bad ? "✗" : "✓"} ${id}${errors.length || warnings.length ? ` (${errors.length} error${errors.length === 1 ? "" : "s"}, ${warnings.length} warning${warnings.length === 1 ? "" : "s"})` : ""}`);
    for (const e of errors) console.log(`    error: ${e}`);
    for (const w of warnings) console.log(`    warning: ${w}`);
    if (bad) failed += 1;
  }
  return failed > 0 ? 1 : 0;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  process.exit(main(process.argv.slice(2)));
}
