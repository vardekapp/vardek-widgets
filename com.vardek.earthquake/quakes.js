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
        id: (f && typeof f.id === "string") ? f.id : null,
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
  // Single source of truth for both the dot color and the on-screen legend.
  const MAG_BANDS = [
    { max: 3, label: "< M3", color: "#3ad16b" },
    { max: 4, label: "M3–4", color: "#ffd60a" },
    { max: 5, label: "M4–5", color: "#ff9f0a" },
    { max: 6, label: "M5–6", color: "#ff453a" },
    { max: Infinity, label: "M6+", color: "#ff2d95" },
  ];

  function magColor(mag) {
    for (const band of MAG_BANDS) if (mag < band.max) return band.color;
    return MAG_BANDS[MAG_BANDS.length - 1].color;
  }

  globalThis.Quakes = { parseQuakes, magRadius, project, magColor, MAG_BANDS };
})();
