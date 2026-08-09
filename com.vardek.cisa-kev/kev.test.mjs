import assert from "node:assert/strict";
import "./kev.js";
const { parseKev, parseFeedText, daysUntil, statusFor, sortEntries } = globalThis.Kev;

const raw = {
  catalogVersion: "2026.08.07",
  dateReleased: "2026-08-07T16:45:47.0648Z",
  vulnerabilities: [
    { cveID: "CVE-2026-8037", vendorProject: "Progress", product: "LoadMaster",
      vulnerabilityName: "Command Injection", dateAdded: "2026-08-07", dueDate: "2026-08-10",
      knownRansomwareCampaignUse: "Unknown" },
    { cveID: "CVE-2026-15409", vendorProject: "SonicWall", product: "SMA1000",
      vulnerabilityName: "SSRF", dateAdded: "2026-07-17", dueDate: "2026-07-17",
      knownRansomwareCampaignUse: "Known" },
    { cveID: "bad-entry" }, // missing dueDate -> dropped
  ],
};

const parsed = parseKev(raw);
assert.equal(parsed.entries.length, 2, "drops malformed entries");
assert.equal(parsed.count, 2);
assert.equal(parsed.entries[0].nvdUrl, "https://nvd.nist.gov/vuln/detail/CVE-2026-8037");
assert.equal(parsed.entries[1].ransomware, true);
assert.equal(parsed.entries[0].ransomware, false);

const now = Date.parse("2026-08-09T12:00:00Z");
assert.equal(daysUntil("2026-08-10", now), 1);
assert.equal(daysUntil("2026-08-09", now), 0);
assert.equal(daysUntil("2026-08-07", now), -2);
assert.equal(daysUntil("not-a-date", now), null);

assert.deepEqual(statusFor(1), { label: "DUE IN 1D", tone: "soon" });
assert.deepEqual(statusFor(0), { label: "DUE TODAY", tone: "overdue" });
assert.deepEqual(statusFor(-2), { label: "OVERDUE 2D", tone: "overdue" });
assert.deepEqual(statusFor(5), { label: "DUE 5D", tone: "ok" });
assert.deepEqual(statusFor(null), { label: "—", tone: "unknown" });

const sortedByDue = sortEntries(parsed.entries, "dueDate");
assert.equal(sortedByDue[0].cveId, "CVE-2026-15409");
const sortedByAdded = sortEntries(parsed.entries, "dateAdded");
assert.equal(sortedByAdded[0].cveId, "CVE-2026-8037");

// Simulates the daemon proxy's 1 MB truncation: valid JSON up to a cut mid-object.
const full = JSON.stringify(raw);
const cutPoint = full.indexOf('"bad-entry"'); // truncate inside the last (already-dropped) entry
const truncated = full.slice(0, cutPoint) + '"CVE-9999';
const recovered = parseFeedText(truncated);
assert.equal(recovered.catalogVersion, "2026.08.07", "recovers header fields past the cut");
assert.equal(recovered.vulnerabilities.length, 2, "recovers every complete object before the cut");
assert.equal(parseKev(recovered).entries.length, 2);

// Untruncated valid JSON still parses the normal way.
assert.deepEqual(parseFeedText(full), raw);

console.log("kev.test.mjs OK");
