import assert from "node:assert/strict";
import "./otd.js";
const { sanitizeLang, datePath, parseCategory, buildRotation, categoryLabel, paginate } = globalThis.Otd;

assert.equal(sanitizeLang("en"), "en");
assert.equal(sanitizeLang("ZH-HANT"), "zh-hant");
assert.equal(sanitizeLang(""), "en");
assert.equal(sanitizeLang("../../etc"), "en");
assert.equal(sanitizeLang(null), "en");

assert.equal(datePath(new Date(Date.UTC(2026, 7, 9))), "08/09"); // month is 0-indexed
assert.equal(datePath(new Date(Date.UTC(2026, 0, 1))), "01/01");

const eventsJson = {
  events: [
    {
      text: "Typhoon Lekima made landfall in Zhejiang, China.",
      year: 2019,
      pages: [
        {
          title: "Typhoon_Lekima",
          thumbnail: { source: "https://upload.wikimedia.org/thumb.jpg" },
          description: "Pacific typhoon in 2019",
          content_urls: { desktop: { page: "https://en.wikipedia.org/wiki/Typhoon_Lekima" } },
        },
      ],
    },
    // Missing page entirely (rare feed gap) -> dropped, not thrown
    { text: "No page here", year: 1999, pages: [] },
    // Missing desktop URL -> dropped
    { text: "No url", year: 2001, pages: [{ title: "X", content_urls: {} }] },
  ],
};

const parsed = parseCategory(eventsJson, "events");
assert.equal(parsed.length, 1);
assert.equal(parsed[0].type, "events");
assert.equal(parsed[0].year, 2019);
assert.equal(parsed[0].url, "https://en.wikipedia.org/wiki/Typhoon_Lekima");
assert.equal(parsed[0].thumb, "https://upload.wikimedia.org/thumb.jpg");

assert.deepEqual(parseCategory({}, "births"), []);
assert.deepEqual(parseCategory({ births: null }, "births"), []);

const holidaysJson = {
  holidays: [
    {
      text: "Argentine Air Force Day (Argentina)",
      pages: [
        {
          title: "Armed_Forces_Day",
          content_urls: { desktop: { page: "https://en.wikipedia.org/wiki/Armed_Forces_Day" } },
        },
      ],
    },
  ],
};
const parsedHolidays = parseCategory(holidaysJson, "holidays");
assert.equal(parsedHolidays[0].year, null);

// Round-robin across categories, capped per category, in fixed category order
const dataByType = {
  events: [{ type: "events", text: "e1" }, { type: "events", text: "e2" }, { type: "events", text: "e3" }],
  births: [{ type: "births", text: "b1" }],
  deaths: [],
};
const rotation = buildRotation(dataByType, ["events", "births", "deaths"], 2);
assert.deepEqual(
  rotation.map((r) => r.text),
  ["e1", "b1", "e2"] // events capped to 2 (e1, e2); e3 dropped; deaths empty
);

// Disabled category is excluded even if data was fetched
const rotationBirthsOff = buildRotation(dataByType, ["events"], 2);
assert.deepEqual(rotationBirthsOff.map((r) => r.text), ["e1", "e2"]);

assert.equal(categoryLabel("events"), "EVENT");
assert.equal(categoryLabel("births"), "BIRTH");
assert.equal(categoryLabel("deaths"), "DEATH");
assert.equal(categoryLabel("holidays"), "HOLIDAY");

const items10 = Array.from({ length: 10 }, (_, i) => ({ text: "i" + i }));
const pages = paginate(items10, 8);
assert.equal(pages.length, 2);
assert.equal(pages[0].length, 8);
assert.equal(pages[1].length, 2);
assert.deepEqual(paginate([], 8), [[]]);

console.log("otd.test.mjs OK");
