// Simplified NOAA solar-position approximation. Accuracy: a few minutes of arc,
// ample for a visual widget. No ephemeris library.
const RAD = Math.PI / 180;

function dayOfYear(date) {
  const start = Date.UTC(date.getUTCFullYear(), 0, 0);
  return (Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()) - start) / 86400000;
}

function subsolarPoint(date) {
  const doy = dayOfYear(date);
  const utcHours = date.getUTCHours() + date.getUTCMinutes() / 60 + date.getUTCSeconds() / 3600;
  // Fractional year (radians).
  const g = (2 * Math.PI / 365) * (doy - 1 + (utcHours - 12) / 24);
  // Equation of time (minutes).
  const eqtime = 229.18 * (0.000075 + 0.001868 * Math.cos(g) - 0.032077 * Math.sin(g)
    - 0.014615 * Math.cos(2 * g) - 0.040849 * Math.sin(2 * g));
  // Solar declination (radians).
  const decl = 0.006918 - 0.399912 * Math.cos(g) + 0.070257 * Math.sin(g)
    - 0.006758 * Math.cos(2 * g) + 0.000907 * Math.sin(2 * g)
    - 0.002697 * Math.cos(3 * g) + 0.00148 * Math.sin(3 * g);
  const declDeg = decl / RAD;
  // Longitude where local solar time is noon.
  let lon = -15 * (utcHours + eqtime / 60 - 12);
  lon = ((lon + 180) % 360 + 360) % 360 - 180; // wrap to [-180, 180]
  return { lat: declDeg, lon, decl: declDeg };
}

function cosZenith(latDeg, lonDeg, sub) {
  const lat = latDeg * RAD, dec = sub.decl * RAD;
  const H = (lonDeg - sub.lon) * RAD;
  return Math.sin(lat) * Math.sin(dec) + Math.cos(lat) * Math.cos(dec) * Math.cos(H);
}

// Classic script (NOT an ES module): widgets load in an opaque-origin sandbox
// where `type="module"` external scripts are CORS-blocked. Expose via global.
// Also readable in Node via side-effect import (see solar.test.mjs).
globalThis.Solar = { subsolarPoint, cosZenith };
