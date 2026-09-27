import assert from "node:assert/strict";
import "./tube.js";
const { stationNames, stationId, lineColor, parseArrivals, parseLineStatuses, fmtCountdown } = globalThis.Tube;

assert.equal(lineColor("Central"), "#E32017");
assert.equal(lineColor("central"), "#E32017", "case-insensitive");
assert.equal(lineColor("Not A Line"), "#8089a6", "unknown line -> neutral fallback");

assert.equal(stationNames().length, 300, "full TfL Naptan station table");
assert.ok(stationNames().includes("Oxford Circus"));
assert.equal(stationId("Oxford Circus"), "940GZZLUOXC");
assert.equal(stationId("Not A Station"), null);

const raw = [
  { lineName: "Central", destinationName: "Ealing Broadway", platformName: "Platform 1", timeToStation: 45, direction: "outbound" },
  { lineName: "Bakerloo", destinationName: "Elephant & Castle", platformName: "Platform 3", timeToStation: 600, direction: "inbound" },
  { lineName: "Central", destinationName: "Epping", platformName: "Platform 2", timeToStation: 120 }, // no direction reported
  { lineName: "Victoria", timeToStation: 30 }, // missing destination -> falls back to ""
];

const all = parseArrivals(raw, {});
assert.equal(all.length, 4, "no filters -> all pass through");
assert.equal(all[0].seconds, 30, "sorted ascending by seconds");
assert.equal(all[0].destination, "", "missing destinationName/towards -> empty string, not a crash");

const byLine = parseArrivals(raw, { lineFilter: "central" });
assert.equal(byLine.length, 2, "line filter is case-insensitive substring match");

const byDir = parseArrivals(raw, { direction: "Inbound" });
assert.equal(byDir.length, 3, "direction filter keeps unknown-direction arrivals rather than hiding them");
assert.ok(byDir.some(a => a.line === "Bakerloo"));
assert.ok(!byDir.some(a => a.line === "Central" && a.destination === "Ealing Broadway"), "outbound Central excluded");

const buffered = parseArrivals(raw, { walkBufferMin: 1 });
assert.equal(buffered.length, 2, "drops arrivals under the 60s walking buffer");

assert.deepEqual(
  parseLineStatuses([
    { name: "Central", lineStatuses: [{ statusSeverityDescription: "Good Service" }] },
    { name: "Northern", lineStatuses: [{ statusSeverityDescription: "Minor Delays" }] },
    { name: "Empty", lineStatuses: [] },
  ]),
  [
    { name: "Central", status: "Good Service", good: true },
    { name: "Northern", status: "Minor Delays", good: false },
    { name: "Empty", status: "Unknown", good: false },
  ]
);

assert.equal(fmtCountdown(20), "Due");
assert.equal(fmtCountdown(30), "Due");
assert.equal(fmtCountdown(31), "1 min");
assert.equal(fmtCountdown(125), "2 min");
assert.equal(fmtCountdown(null), "—");

console.log("tube.test.mjs OK");
