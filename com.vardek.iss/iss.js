// Pure helper for the ISS Tracker widget. Classic script (no export),
// exposes globalThis.ISS for both index.html and iss.test.mjs.
(function () {
  function project(lon, lat, W, H) {
    return { x: (lon + 180) / 360 * W, y: (90 - lat) / 180 * H };
  }

  function issMarker(sample) {
    const lat = sample && sample.latitude;
    const lon = sample && sample.longitude;
    if (typeof lat !== "number" || !Number.isFinite(lat)) return null;
    if (typeof lon !== "number" || !Number.isFinite(lon)) return null;
    return {
      lat,
      lon,
      altKm: sample.altitude,
      velKmh: sample.velocity,
    };
  }

  globalThis.ISS = { project, issMarker };
})();
