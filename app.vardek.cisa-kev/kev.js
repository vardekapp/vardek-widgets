// Pure helper for the CISA KEV widget. Classic script (no export),
// exposes globalThis.Kev for both index.html and kev.test.mjs.
(function () {
  const DAY_MS = 86400000;

  function parseKev(json) {
    const raw = (json && Array.isArray(json.vulnerabilities)) ? json.vulnerabilities : [];
    const out = [];
    for (const v of raw) {
      if (!v || typeof v.cveID !== "string" || typeof v.dueDate !== "string") continue;
      out.push({
        cveId: v.cveID,
        vendor: typeof v.vendorProject === "string" ? v.vendorProject : "",
        product: typeof v.product === "string" ? v.product : "",
        name: typeof v.vulnerabilityName === "string" ? v.vulnerabilityName : "",
        dateAdded: typeof v.dateAdded === "string" ? v.dateAdded : "",
        dueDate: v.dueDate,
        ransomware: v.knownRansomwareCampaignUse === "Known",
        nvdUrl: "https://nvd.nist.gov/vuln/detail/" + encodeURIComponent(v.cveID),
      });
    }
    return {
      catalogVersion: typeof json?.catalogVersion === "string" ? json.catalogVersion : "",
      dateReleased: typeof json?.dateReleased === "string" ? json.dateReleased : "",
      count: out.length,
      entries: out,
    };
  }

  // Whole days between nowMs and the entry's due date, negative once overdue.
  function daysUntil(dueDate, nowMs) {
    const due = Date.parse(dueDate + "T23:59:59Z");
    if (!Number.isFinite(due)) return null;
    return Math.floor((due - nowMs) / DAY_MS);
  }

  function statusFor(days) {
    if (days === null) return { label: "—", tone: "unknown" };
    if (days < 0) return { label: "OVERDUE " + Math.abs(days) + "D", tone: "overdue" };
    if (days === 0) return { label: "DUE TODAY", tone: "overdue" };
    if (days <= 2) return { label: "DUE IN " + days + "D", tone: "soon" };
    return { label: "DUE " + days + "D", tone: "ok" };
  }

  function sortEntries(entries, sort) {
    const copy = entries.slice();
    if (sort === "dateAdded") {
      copy.sort((a, b) => b.dateAdded.localeCompare(a.dateAdded));
    } else {
      copy.sort((a, b) => a.dueDate.localeCompare(b.dueDate));
    }
    return copy;
  }

  // The daemon proxy caps responses at 1 MB (SecurityDefense, shared across all
  // widgets); the live CISA feed runs ~1.6 MB and counts only grow. A hard cap
  // truncates mid-object, so `JSON.parse` on the raw text throws. The feed lists
  // entries newest-first, so the truncated tail is old history this widget never
  // shows anyway — recover every complete `{...}` object before the cut instead
  // of discarding the whole response.
  function parseFeedText(text) {
    try {
      return JSON.parse(text);
    } catch (e) {
      return parseTruncatedFeed(text);
    }
  }

  function parseTruncatedFeed(text) {
    const header = {};
    for (const key of ["catalogVersion", "dateReleased"]) {
      const m = text.match(new RegExp('"' + key + '"\\s*:\\s*"([^"]*)"'));
      if (m) header[key] = m[1];
    }
    const arrayStart = text.indexOf('"vulnerabilities"');
    const bracket = arrayStart >= 0 ? text.indexOf("[", arrayStart) : -1;
    const vulnerabilities = bracket >= 0 ? extractCompleteObjects(text, bracket + 1) : [];
    return Object.assign({ vulnerabilities }, header);
  }

  // Scans from `start` for complete top-level `{...}` objects (tracking string
  // escapes so braces inside quoted text don't skew depth), stopping at the
  // first object left incomplete by truncation.
  function extractCompleteObjects(text, start) {
    const out = [];
    let depth = 0, objStart = -1, inString = false, escaped = false;
    for (let i = start; i < text.length; i++) {
      const c = text[i];
      if (inString) {
        if (escaped) escaped = false;
        else if (c === "\\") escaped = true;
        else if (c === '"') inString = false;
        continue;
      }
      if (c === '"') { inString = true; continue; }
      if (c === "{") { if (depth === 0) objStart = i; depth++; }
      else if (c === "}") {
        depth--;
        if (depth === 0 && objStart >= 0) {
          const raw = text.slice(objStart, i + 1);
          try { out.push(JSON.parse(raw)); } catch (e) { /* skip malformed */ }
          objStart = -1;
        }
      } else if (c === "]" && depth === 0) {
        break;
      }
    }
    return out;
  }

  globalThis.Kev = { parseKev, parseFeedText, daysUntil, statusFor, sortEntries };
})();
