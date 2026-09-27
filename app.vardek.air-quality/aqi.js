// Pure helpers for the Air Quality widget — no DOM, no network.
// Classic script (no ES modules — opaque-origin sandbox), exposes globalThis.Aqi.
(function () {
  function num(v) {
    return typeof v === "number" && Number.isFinite(v) ? v : null;
  }

  function parseGeocode(json) {
    const r = json && Array.isArray(json.results) && json.results[0];
    if (!r || typeof r.latitude !== "number" || typeof r.longitude !== "number") return null;
    return {
      name: String(r.name || ""),
      admin1: String(r.admin1 || ""),
      country: String(r.country_code || r.country || ""),
      lat: r.latitude,
      lon: r.longitude,
    };
  }

  function usAqiInfo(v) {
    v = num(v);
    if (v === null) return { label: "—", tone: "unknown" };
    if (v <= 50) return { label: "GOOD", tone: "ok" };
    if (v <= 100) return { label: "MODERATE", tone: "ok" };
    if (v <= 150) return { label: "UNHEALTHY (SENS.)", tone: "warn" };
    if (v <= 200) return { label: "UNHEALTHY", tone: "warn" };
    if (v <= 300) return { label: "VERY UNHEALTHY", tone: "critical" };
    return { label: "HAZARDOUS", tone: "critical" };
  }

  function euAqiInfo(v) {
    v = num(v);
    if (v === null) return { label: "—", tone: "unknown" };
    if (v <= 20) return { label: "GOOD", tone: "ok" };
    if (v <= 40) return { label: "FAIR", tone: "ok" };
    if (v <= 60) return { label: "MODERATE", tone: "warn" };
    if (v <= 80) return { label: "POOR", tone: "warn" };
    if (v <= 100) return { label: "VERY POOR", tone: "critical" };
    return { label: "EXTREMELY POOR", tone: "critical" };
  }

  // Every pollutant selectable in widget settings, in Open-Meteo's exact
  // `current=`/`hourly=` parameter spelling. defaultOn matches the widget's
  // original fixed six; the rest opt in via settings.
  const POLLUTANTS = [
    { key: "pm2_5",            label: "Fine Particles",   unit: "µg/m³", defaultOn: true },
    { key: "pm10",             label: "Coarse Particles", unit: "µg/m³", defaultOn: true },
    { key: "ozone",            label: "Ozone",            unit: "µg/m³", defaultOn: true },
    { key: "nitrogen_dioxide", label: "Nitrogen Dioxide", unit: "µg/m³", defaultOn: true },
    { key: "sulphur_dioxide",  label: "Sulfur Dioxide",   unit: "µg/m³", defaultOn: true },
    { key: "carbon_monoxide",  label: "Carbon Monoxide",  unit: "µg/m³", defaultOn: true },
    { key: "carbon_dioxide",   label: "Carbon Dioxide",   unit: "ppm",   defaultOn: false },
    { key: "ammonia",          label: "Ammonia",          unit: "µg/m³", defaultOn: false },
    { key: "methane",          label: "Methane",          unit: "µg/m³", defaultOn: false },
    { key: "dust",             label: "Dust",             unit: "µg/m³", defaultOn: false },
    // Europe only, in season, 4-day forecast horizon — see README footnote.
    { key: "alder_pollen",    label: "Alder Pollen",    unit: "grains/m³", defaultOn: false, euOnly: true },
    { key: "birch_pollen",    label: "Birch Pollen",    unit: "grains/m³", defaultOn: false, euOnly: true },
    { key: "grass_pollen",    label: "Grass Pollen",    unit: "grains/m³", defaultOn: false, euOnly: true },
    { key: "mugwort_pollen",  label: "Mugwort Pollen",  unit: "grains/m³", defaultOn: false, euOnly: true },
    { key: "olive_pollen",    label: "Olive Pollen",    unit: "grains/m³", defaultOn: false, euOnly: true },
    { key: "ragweed_pollen",  label: "Ragweed Pollen",  unit: "grains/m³", defaultOn: false, euOnly: true },
  ];

  // ponytail: simplified 3-tier breakpoints per pollutant (rough WHO/EPA blend
  // where one exists, a loose ambient-scale guess otherwise) — good enough for
  // a glance widget, not a regulatory multi-averaging-period table. MAX sets
  // the gauge-fill ceiling (visual scale, not a safety limit).
  const POLLUTANT_BREAKS = {
    pm2_5: [15, 35],
    pm10: [45, 100],
    ozone: [100, 180],
    nitrogen_dioxide: [40, 100],
    sulphur_dioxide: [40, 125],
    carbon_monoxide: [4000, 10000],
    carbon_dioxide: [1000, 2000],
    ammonia: [50, 150],
    methane: [2000, 4000],
    dust: [50, 150],
    // Rough general pollen-index tiers (grains/m³); ragweed's threshold sits
    // far lower than tree/grass species — even light counts trigger allergy.
    alder_pollen: [50, 500],
    birch_pollen: [50, 500],
    grass_pollen: [20, 100],
    mugwort_pollen: [10, 50],
    olive_pollen: [10, 100],
    ragweed_pollen: [5, 20],
  };
  const POLLUTANT_MAX = {
    pm2_5: 70,
    pm10: 200,
    ozone: 300,
    nitrogen_dioxide: 200,
    sulphur_dioxide: 250,
    carbon_monoxide: 15000,
    carbon_dioxide: 3000,
    ammonia: 300,
    methane: 6000,
    dust: 300,
    alder_pollen: 1000,
    birch_pollen: 1000,
    grass_pollen: 200,
    mugwort_pollen: 100,
    olive_pollen: 300,
    ragweed_pollen: 50,
  };

  function pollutantTone(key, v) {
    v = num(v);
    const b = POLLUTANT_BREAKS[key];
    if (v === null || !b) return "unknown";
    if (v <= b[0]) return "ok";
    if (v <= b[1]) return "warn";
    return "critical";
  }

  function pollutantPct(key, v) {
    v = num(v);
    const max = POLLUTANT_MAX[key];
    if (v === null || !max) return 0;
    return Math.min(v / max, 1) * 100;
  }

  function parseCurrent(json) {
    const c = json && json.current;
    if (!c) return null;
    return {
      time: c.time || null,
      usAqi: num(c.us_aqi),
      euAqi: num(c.european_aqi),
      pm2_5: num(c.pm2_5),
      pm10: num(c.pm10),
      ozone: num(c.ozone),
      nitrogen_dioxide: num(c.nitrogen_dioxide),
      sulphur_dioxide: num(c.sulphur_dioxide),
      carbon_monoxide: num(c.carbon_monoxide),
      carbon_dioxide: num(c.carbon_dioxide),
      ammonia: num(c.ammonia),
      methane: num(c.methane),
      dust: num(c.dust),
      alder_pollen: num(c.alder_pollen),
      birch_pollen: num(c.birch_pollen),
      grass_pollen: num(c.grass_pollen),
      mugwort_pollen: num(c.mugwort_pollen),
      olive_pollen: num(c.olive_pollen),
      ragweed_pollen: num(c.ragweed_pollen),
    };
  }

  globalThis.Aqi = {
    POLLUTANTS,
    parseGeocode,
    parseCurrent,
    usAqiInfo,
    euAqiInfo,
    pollutantTone,
    pollutantPct,
  };
})();
