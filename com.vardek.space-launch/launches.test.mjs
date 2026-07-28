import assert from "node:assert/strict";
import "./launches.js";
const { parseLaunches, formatCountdown } = globalThis.Launches;
const json = { results: [
  { name:"Falcon 9 | Starlink", net:"2026-07-29T11:50:00Z", lsp_name:"SpaceX", pad:"SLC-40" },
  { name:"Bad", net:null, lsp_name:"X", pad:"1" },  // dropped
]};
const L = parseLaunches(json);
assert.equal(L.length, 1, "drops invalid net");
assert.equal(L[0].name, "Falcon 9 | Starlink");
assert.equal(L[0].provider, "SpaceX");
assert.equal(L[0].netMs, Date.parse("2026-07-29T11:50:00Z"));
assert.equal(formatCountdown(90061000), "1d 01:01:01");   // 1d 1h 1m 1s
assert.equal(formatCountdown(3661000), "01:01:01");        // <1 day, no prefix
assert.equal(formatCountdown(0), "LIFTOFF");
assert.equal(formatCountdown(-5000), "LIFTOFF");
console.log("launches.test.mjs OK");
