// Pure helper for the ISS Tracker widget. Classic script (no export),
// exposes globalThis.ISS for both index.html and iss.test.mjs.
// Uses globalThis.satellite (satellite.js UMD; set by satellite.min.js in the
// browser, or by the test harness before importing this file).
(function () {
  function project(lon, lat, W, H) {
    return { x: (lon + 180) / 360 * W, y: (90 - lat) / 180 * H };
  }

  function parseTLE(text) {
    if (typeof text !== "string") return null;
    const lines = text.split("\n").map(l => l.trim()).filter(l => l.length > 0);
    const l1 = lines.find(l => l.startsWith("1 "));
    const l2 = lines.find(l => l.startsWith("2 "));
    if (!l1 || !l2) return null;
    const name = lines[0];
    return { name, l1, l2 };
  }

  function wrapLon(lon) {
    let l = lon;
    while (l > 180) l -= 360;
    while (l < -180) l += 360;
    return l;
  }

  function subpoint(satrec, date) {
    try {
      const pv = globalThis.satellite.propagate(satrec, date);
      if (!pv || !pv.position) return null;
      const gmst = globalThis.satellite.gstime(date);
      const geo = globalThis.satellite.eciToGeodetic(pv.position, gmst);
      const lat = globalThis.satellite.degreesLat(geo.latitude);
      const lon = wrapLon(globalThis.satellite.degreesLong(geo.longitude));
      const altKm = geo.height;
      const velKmh = pv.velocity
        ? Math.hypot(pv.velocity.x, pv.velocity.y, pv.velocity.z) * 3600
        : 0;
      return { lat, lon, altKm, velKmh };
    } catch (err) {
      return null;
    }
  }

  function groundTrack(satrec, startMs, endMs, stepMs) {
    const out = [];
    for (let t = startMs; t <= endMs; t += stepMs) {
      const p = subpoint(satrec, new Date(t));
      if (p) out.push({ lat: p.lat, lon: p.lon });
    }
    return out;
  }

  globalThis.ISS = { project, parseTLE, subpoint, groundTrack };
})();
