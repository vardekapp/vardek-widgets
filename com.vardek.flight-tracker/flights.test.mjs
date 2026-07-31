import assert from "node:assert/strict";
import "./flights.js";
const { parseCodes, parseFlight, fmtTime, routeProgress } = globalThis.Flights;

assert.deepEqual(parseCodes(" ua804, dal123 ,,bad!code,ba1,aa1,ok1,extra1"), ["UA804", "DAL123", "BA1", "AA1"], "trims/uppercases/dedupes junk/caps at 4");
assert.deepEqual(parseCodes(""), [], "empty input -> no codes");

const full = [{
  number: "UA804",
  airline: { name: "United" },
  aircraft: { model: "Boeing 787-9" },
  status: "En Route",
  departure: { airport: { iata: "SFO" }, revisedTime: { local: "2024-06-01 08:05-07:00" } },
  arrival: { airport: { iata: "NRT" }, scheduledTime: { local: "2024-06-02 15:30+09:00" } },
  location: { pressureAltitude: { feet: 38000 }, groundSpeed: { kt: 480 }, trueTrack: { deg: 295.4 } },
}];
const f = parseFlight(full);
assert.equal(f.airline, "United");
assert.equal(f.depIata, "SFO");
assert.equal(f.arrIata, "NRT");
assert.equal(f.altitudeFt, 38000);
assert.equal(f.speedKt, 480);
assert.equal(f.headingDeg, 295.4);
assert.equal(fmtTime(f.depTime), "08:05");
assert.equal(fmtTime(f.arrTime), "15:30");

// No ADS-B location (normal — ground/no coverage): altitude/speed/heading fall back independently.
const noLocation = [{ number: "UA804", departure: { airport: { iata: "SFO" } }, arrival: { airport: { iata: "NRT" } } }];
const g = parseFlight(noLocation);
assert.equal(g.altitudeFt, null);
assert.equal(g.speedKt, null);
assert.equal(g.headingDeg, null);
assert.equal(fmtTime(g.depTime), "—");

assert.equal(parseFlight([]), null, "empty array -> null");
assert.equal(parseFlight(null), null, "null -> null");

// Real AeroDataBox response (UA804, 2026-07-31): arrival has predictedTime, not
// revisedTime/estimatedTime — regression case for the field-name bug where
// arrival time silently fell back to "—".
const real = [{
  departure: { airport: { iata: "HND" }, scheduledTime: { local: "2026-07-31 15:45+09:00" }, revisedTime: { local: "2026-07-31 15:58+09:00" } },
  arrival: { airport: { iata: "IAD" }, scheduledTime: { local: "2026-07-31 15:50-04:00" }, predictedTime: { local: "2026-07-31 15:59-04:00" } },
  number: "UA 804",
  status: "Departed",
  aircraft: { model: "Boeing 777-200" },
  airline: { name: "United Airlines" },
}];
const r = parseFlight(real);
assert.equal(fmtTime(r.depTime), "15:58", "prefers revisedTime over scheduledTime");
assert.equal(fmtTime(r.arrTime), "15:59", "falls back to predictedTime, not stuck on scheduledTime");
assert.equal(r.altitudeFt, null, "no location block in this leg -> null, not a crash");

// Real AeroDataBox response (AAL221, in flight): location fields are unit
// OBJECTS ({feet,meter,...}), not raw numbers — regression case for the bug
// where altitude/speed/heading silently fell back to "—" via parseFloat(obj).
const airborne = [{
  departure: { airport: { iata: "AMS", location: { lat: 52.3086, lon: 4.763889 } }, revisedTime: { local: "2026-07-31 11:23+02:00" } },
  arrival: { airport: { iata: "DFW", location: { lat: 32.8968, lon: -97.038 } }, predictedTime: { local: "2026-07-31 14:08-05:00" } },
  number: "AA 221",
  aircraft: { model: "Boeing 777-200" },
  airline: { name: "American Airlines" },
  location: {
    pressureAltitude: { feet: 38000.0 },
    groundSpeed: { kt: 472.0 },
    trueTrack: { deg: 265.0 },
    lat: 37.134613,
    lon: -90.070946,
  },
}];
const a = parseFlight(airborne);
assert.equal(a.altitudeFt, 38000, "reads pressureAltitude.feet, not the object itself");
assert.equal(a.speedKt, 472, "reads groundSpeed.kt, not the object itself");
assert.equal(a.headingDeg, 265, "reads trueTrack.deg, not the object itself");
assert.deepEqual(a.depLatLon, { lat: 52.3086, lon: 4.763889 });
assert.deepEqual(a.arrLatLon, { lat: 32.8968, lon: -97.038 });
assert.deepEqual(a.curLatLon, { lat: 37.134613, lon: -90.070946 });

const p = routeProgress(a.depLatLon, a.arrLatLon, a.curLatLon);
assert.ok(p > 0.85 && p < 0.95, `AAL221 near-Dallas position should be ~90% flown, got ${p}`);
assert.equal(routeProgress(a.depLatLon, a.arrLatLon, a.depLatLon), 0, "at departure -> 0");
assert.equal(routeProgress(a.depLatLon, a.arrLatLon, a.arrLatLon), 1, "at arrival -> 1");
assert.equal(routeProgress(a.depLatLon, a.arrLatLon, null), null, "no live position -> null, not a guess");

console.log("flights.test.mjs OK");
