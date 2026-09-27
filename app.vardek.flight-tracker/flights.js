// Pure helpers for the Flight Tracker widget. Classic script (no export),
// exposes globalThis.Flights for both index.html and flights.test.mjs.
(function () {
  function parseCodes(raw) {
    return String(raw || "")
      .split(",")
      .map(s => s.trim().toUpperCase())
      .filter(s => /^[A-Z0-9]{2,8}$/.test(s))
      .slice(0, 4);
  }

  // AeroDataBox nests times/locations under a few possible key names
  // depending on flight phase and API version; try each in order.
  function pick(obj, paths) {
    for (const path of paths) {
      let v = obj;
      for (const key of path.split(".")) {
        v = v && typeof v === "object" ? v[key] : undefined;
      }
      if (v !== undefined && v !== null && v !== "") return v;
    }
    return null;
  }

  // AeroDataBox's "flights by number" endpoint returns an array (a flight
  // number can match more than one dated leg); take the first entry.
  function parseFlight(json) {
    const f = Array.isArray(json) ? json[0] : json;
    if (!f) return null;

    const dep = f.departure || {};
    const arr = f.arrival || {};
    const loc = f.location || {};

    return {
      number: pick(f, ["number", "flight.number"]) || "",
      airline: pick(f, ["airline.name"]) || "",
      aircraft: pick(f, ["aircraft.model"]) || "",
      status: pick(f, ["status"]) || "",
      depIata: pick(dep, ["airport.iata", "airport.icao"]) || "—",
      arrIata: pick(arr, ["airport.iata", "airport.icao"]) || "—",
      depTime: pick(dep, ["revisedTime.local", "predictedTime.local", "actualTime.local", "runwayTime.local", "scheduledTime.local"]),
      arrTime: pick(arr, ["revisedTime.local", "predictedTime.local", "actualTime.local", "runwayTime.local", "scheduledTime.local"]),
      altitudeFt: numOrNull(pick(loc, ["pressureAltitude.feet", "reportedAltitude.feet"])),
      speedKt: numOrNull(pick(loc, ["groundSpeed.kt"])),
      headingDeg: numOrNull(pick(loc, ["trueTrack.deg", "track.deg"])),
      depLatLon: latLon(pick(dep, ["airport.location"])),
      arrLatLon: latLon(pick(arr, ["airport.location"])),
      curLatLon: latLon(loc),
    };
  }

  function numOrNull(v) {
    const n = typeof v === "number" ? v : parseFloat(v);
    return Number.isFinite(n) ? n : null;
  }

  function latLon(obj) {
    const lat = obj && numOrNull(obj.lat);
    const lon = obj && numOrNull(obj.lon);
    return (lat != null && lon != null) ? { lat, lon } : null;
  }

  function haversineKm(a, b) {
    const R = 6371;
    const dLat = (b.lat - a.lat) * Math.PI / 180;
    const dLon = (b.lon - a.lon) * Math.PI / 180;
    const la1 = a.lat * Math.PI / 180, la2 = b.lat * Math.PI / 180;
    const h = Math.sin(dLat / 2) ** 2 + Math.cos(la1) * Math.cos(la2) * Math.sin(dLon / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(h));
  }

  // Fraction of the route flown, from live position projected onto the
  // dep->arr great-circle distance. Null when any coordinate is missing
  // (no live ADS-B fix) rather than guessing from elapsed time.
  function routeProgress(dep, arr, cur) {
    if (!dep || !arr || !cur) return null;
    const total = haversineKm(dep, arr);
    if (total <= 0) return null;
    const flown = haversineKm(dep, cur);
    return Math.max(0, Math.min(1, flown / total));
  }

  // "2024-06-01 08:05-05:00" / ISO -> "08:05". Falls back to "—".
  function fmtTime(local) {
    if (!local) return "—";
    const m = String(local).match(/(\d{2}):(\d{2})/);
    return m ? `${m[1]}:${m[2]}` : "—";
  }

  globalThis.Flights = { parseCodes, parseFlight, fmtTime, routeProgress };
})();
