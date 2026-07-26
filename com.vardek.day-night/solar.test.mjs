import assert from "node:assert/strict";
import "./solar.js"; // classic script; side-effect sets globalThis.Solar
const { subsolarPoint, cosZenith } = globalThis.Solar;

// Northern summer solstice ~ 2025-06-21 12:00 UTC: sun near +23.4 lat, lon near 0.
const solstice = new Date(Date.UTC(2025, 5, 21, 12, 0, 0));
const s = subsolarPoint(solstice);
assert.ok(Math.abs(s.lat - 23.4) < 1.0, `solstice decl ~23.4, got ${s.lat}`);
assert.ok(Math.abs(s.lon) < 5, `UTC noon subsolar lon ~0, got ${s.lon}`);

// Declination always within the axial-tilt envelope.
for (let m = 0; m < 12; m++) {
  const d = subsolarPoint(new Date(Date.UTC(2025, m, 15, 0, 0, 0)));
  assert.ok(Math.abs(d.lat) <= 23.45, `decl in range, got ${d.lat} for month ${m}`);
}

// cosZenith: +1 at the subsolar point, -1 at its antipode.
assert.ok(cosZenith(s.lat, s.lon, s) > 0.999, "zenith 1 at subsolar point");
const antiLat = -s.lat;
const antiLon = s.lon > 0 ? s.lon - 180 : s.lon + 180;
assert.ok(cosZenith(antiLat, antiLon, s) < -0.999, "zenith -1 at antipode");

// Equinox does not blow up (decl ~ 0): finite zenith everywhere.
const eq = subsolarPoint(new Date(Date.UTC(2025, 2, 20, 12, 0, 0)));
for (let lon = -180; lon <= 180; lon += 30) {
  assert.ok(Number.isFinite(cosZenith(10, lon, eq)), `finite at lon ${lon}`);
}

console.log("solar.test.mjs OK");
