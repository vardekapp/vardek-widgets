import assert from "node:assert/strict";
import "./lava.js";
const { palette, speedFactor, blobCount, PALETTES } = globalThis.Lava;

// palette: known schemes return their color array; unknown falls back to classic.
assert.deepEqual(palette("aqua"), PALETTES.aqua);
assert.deepEqual(palette("nope"), PALETTES.classic);
for (const k of Object.keys(PALETTES)) {
  assert.ok(Array.isArray(palette(k)) && palette(k).length >= 2, `${k} has colors`);
  assert.ok(palette(k).every((c) => /^#[0-9a-f]{6}$/i.test(c)), `${k} colors are hex`);
}

// speedFactor: ordered slow < medium < fast, medium = 1.
assert.ok(speedFactor("slow") < speedFactor("medium"));
assert.ok(speedFactor("medium") < speedFactor("fast"));
assert.equal(speedFactor("medium"), 1.0);
assert.equal(speedFactor("whatever"), 1.0);

// blobCount: few < some < many, positive ints.
assert.ok(blobCount("few") < blobCount("some"));
assert.ok(blobCount("some") < blobCount("many"));
assert.ok(Number.isInteger(blobCount("many")) && blobCount("many") > 0);

console.log("lava.test.mjs OK");
