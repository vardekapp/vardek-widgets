import assert from "node:assert/strict";
import "./aqi.js";
const { parseGeocode, parseCurrent, usAqiInfo, euAqiInfo, pollutantTone, pollutantPct } = globalThis.Aqi;

const geo = parseGeocode({
  results: [{ name: "London", admin1: "England", country_code: "GB", latitude: 51.5, longitude: -0.12 }],
});
assert.equal(geo.name, "London");
assert.equal(geo.lat, 51.5);
assert.equal(parseGeocode({ results: [] }), null);
assert.equal(parseGeocode({}), null);

assert.deepEqual(usAqiInfo(30), { label: "GOOD", tone: "ok" });
assert.deepEqual(usAqiInfo(100), { label: "MODERATE", tone: "ok" });
assert.deepEqual(usAqiInfo(101), { label: "UNHEALTHY (SENS.)", tone: "warn" });
assert.deepEqual(usAqiInfo(200), { label: "UNHEALTHY", tone: "warn" });
assert.deepEqual(usAqiInfo(201), { label: "VERY UNHEALTHY", tone: "critical" });
assert.deepEqual(usAqiInfo(400), { label: "HAZARDOUS", tone: "critical" });
assert.deepEqual(usAqiInfo(null), { label: "—", tone: "unknown" });

assert.deepEqual(euAqiInfo(15), { label: "GOOD", tone: "ok" });
assert.deepEqual(euAqiInfo(61), { label: "POOR", tone: "warn" });
assert.deepEqual(euAqiInfo(101), { label: "EXTREMELY POOR", tone: "critical" });

assert.equal(pollutantTone("pm2_5", 10), "ok");
assert.equal(pollutantTone("pm2_5", 20), "warn");
assert.equal(pollutantTone("pm2_5", 50), "critical");
assert.equal(pollutantTone("unknown_key", 10), "unknown");
assert.equal(pollutantTone("pm2_5", null), "unknown");

assert.equal(pollutantPct("pm2_5", 35), 50);
assert.equal(pollutantPct("pm2_5", 700), 100); // clamps at ceiling
assert.equal(pollutantPct("pm2_5", null), 0);

const current = parseCurrent({
  current: {
    time: "2026-08-09T12:00",
    us_aqi: 42,
    european_aqi: 18,
    pm2_5: 8.1,
    pm10: 15.2,
    ozone: 60,
    nitrogen_dioxide: 12,
    sulphur_dioxide: 3,
    carbon_monoxide: 220,
  },
});
assert.equal(current.usAqi, 42);
assert.equal(current.pm2_5, 8.1);
assert.equal(parseCurrent({}), null);

console.log("aqi.test.mjs OK");
