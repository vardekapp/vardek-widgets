// Pure helpers for the Picture of the Day widget — no DOM, no network.
// Classic script (no ES modules — opaque-origin sandbox), exposes globalThis.Potd.
(function () {
  const LANG_RE = /^[a-z]{2,3}(-[a-z]+)?$/i;

  function sanitizeLang(v) {
    const s = String(v || "").trim();
    return LANG_RE.test(s) ? s.toLowerCase() : "en";
  }

  // yyyy/mm/dd path for the featured-feed endpoint, from a UTC Date.
  function datePath(date) {
    const yyyy = date.getUTCFullYear();
    const mm = String(date.getUTCMonth() + 1).padStart(2, "0");
    const dd = String(date.getUTCDate()).padStart(2, "0");
    return `${yyyy}/${mm}/${dd}`;
  }

  function truncate(text, max) {
    if (!text || text.length <= max) return text || "";
    return text.slice(0, max - 1).trimEnd() + "…";
  }

  // Normalizes the REST API's `image` field (feed/featured/{date}) into the
  // flat shape the widget renders. Returns null when no image ran that day
  // (rare, but the endpoint omits the field rather than erroring).
  function parseFeatured(json, lang) {
    const img = json && json.image;
    if (!img || !img.thumbnail || !img.thumbnail.source) return null;

    const captions = (img.structured && img.structured.captions) || {};
    const shortCaption = captions[lang] || captions.en || null;
    const descriptionText = (img.description && img.description.text) || "";

    return {
      thumbSrc: img.thumbnail.source,
      fullSrc: (img.image && img.image.source) || img.thumbnail.source,
      filePage: img.file_page || null,
      artist: (img.artist && img.artist.text) || "",
      license: (img.license && img.license.type) || "",
      licenseUrl: (img.license && img.license.url) || null,
      headline: shortCaption || truncate(descriptionText, 60) || "Picture of the Day",
      description: descriptionText,
    };
  }

  globalThis.Potd = { sanitizeLang, datePath, truncate, parseFeatured };
})();
