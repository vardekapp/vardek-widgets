import assert from "node:assert/strict";
import "./potd.js";
const { sanitizeLang, datePath, truncate, parseFeatured } = globalThis.Potd;

assert.equal(sanitizeLang("en"), "en");
assert.equal(sanitizeLang("ZH-HANT"), "zh-hant");
assert.equal(sanitizeLang("de"), "de");
assert.equal(sanitizeLang(""), "en");
assert.equal(sanitizeLang("../../etc"), "en");
assert.equal(sanitizeLang("en/evil.com"), "en");
assert.equal(sanitizeLang(null), "en");

assert.equal(datePath(new Date(Date.UTC(2026, 7, 9))), "2026/08/09"); // month is 0-indexed
assert.equal(datePath(new Date(Date.UTC(2026, 0, 1))), "2026/01/01");

assert.equal(truncate("hello", 10), "hello");
assert.equal(truncate("hello world", 8), "hello w…");
assert.equal(truncate("", 8), "");
assert.equal(truncate(null, 8), "");

const raw = {
  image: {
    title: "File:Test_Photo.jpg",
    thumbnail: { source: "https://upload.wikimedia.org/thumb.jpg", width: 640, height: 440 },
    image: { source: "https://upload.wikimedia.org/full.jpg", width: 4000, height: 3000 },
    file_page: "https://commons.wikimedia.org/wiki/File:Test_Photo.jpg",
    artist: { html: "<a>Someone</a>", text: "Someone" },
    license: { type: "CC BY-SA 4.0", url: "https://creativecommons.org/licenses/by-sa/4.0" },
    description: { html: "<p>A lake.</p>", text: "A lake in the mountains at sunrise.", lang: "en" },
    structured: { captions: { en: "mountain lake", nl: "berg meer" } },
  },
};

const parsed = parseFeatured(raw, "en");
assert.equal(parsed.thumbSrc, "https://upload.wikimedia.org/thumb.jpg");
assert.equal(parsed.fullSrc, "https://upload.wikimedia.org/full.jpg");
assert.equal(parsed.artist, "Someone");
assert.equal(parsed.license, "CC BY-SA 4.0");
assert.equal(parsed.headline, "mountain lake");
assert.equal(parsed.description, "A lake in the mountains at sunrise.");

// No structured caption for requested lang, and none for en fallback either -> truncated description
const rawNoCaption = { image: { ...raw.image, structured: { captions: { nl: "berg meer" } } } };
const parsedNoCaption = parseFeatured(rawNoCaption, "de");
assert.equal(parsedNoCaption.headline, "A lake in the mountains at sunrise.");

// Missing image field entirely (rare feed gap) -> null, caller falls back to a prior day
assert.equal(parseFeatured({}, "en"), null);
assert.equal(parseFeatured({ image: {} }, "en"), null);

console.log("potd.test.mjs OK");
