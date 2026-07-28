// Pure helper for the Earthquake Monitor widget. Classic script (no export),
// exposes globalThis.Quakes for both index.html and quakes.test.mjs.
(function () {
  function parseQuakes(geojson) {
    const features = (geojson && Array.isArray(geojson.features)) ? geojson.features : [];
    const out = [];
    for (const f of features) {
      const coords = f && f.geometry && f.geometry.coordinates;
      const props = f && f.properties;
      if (!Array.isArray(coords) || coords.length < 2) continue;
      const lon = coords[0], lat = coords[1];
      const mag = props ? props.mag : undefined;
      if (typeof lon !== "number" || typeof lat !== "number") continue;
      if (typeof mag !== "number" || !Number.isFinite(mag)) continue;
      out.push({
        lat,
        lon,
        mag,
        depth: typeof coords[2] === "number" ? coords[2] : null,
        place: (props && typeof props.place === "string") ? props.place : "",
        timeMs: (props && typeof props.time === "number") ? props.time : null,
      });
    }
    return out;
  }

  function magRadius(mag) {
    return 4 + Math.pow(Math.max(mag, 0), 1.6);
  }

  function project(lon, lat, W, H) {
    return { x: (lon + 180) / 360 * W, y: (90 - lat) / 180 * H };
  }

  // Distinct magnitude bands (not a smooth blend) so overlapping dots stay legible.
  function magColor(mag) {
    if (mag < 3) return "#3ad16b";
    if (mag < 4) return "#ffd60a";
    if (mag < 5) return "#ff9f0a";
    if (mag < 6) return "#ff453a";
    return "#ff2d95";
  }

  globalThis.Quakes = { parseQuakes, magRadius, project, magColor };
})();
