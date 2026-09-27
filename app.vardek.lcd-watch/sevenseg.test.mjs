import assert from "node:assert/strict";
import "./sevenseg.js"; // classic script; side-effect sets globalThis.SevenSeg
const { segmentsFor } = globalThis.SevenSeg;

const lit = (s) => Object.entries(s).filter(([, v]) => v).map(([k]) => k).sort().join("");

assert.equal(lit(segmentsFor("8")), "abcdefg", "8 lights all seven");
assert.equal(lit(segmentsFor("1")), "bc", "1 lights b,c");
assert.equal(lit(segmentsFor("0")), "abcdef", "0 lights all but g");
assert.equal(lit(segmentsFor("7")), "abc", "7 lights a,b,c");
assert.equal(lit(segmentsFor("2")), "abdeg", "2 lights a,b,g,e,d");
assert.equal(lit(segmentsFor("-")), "g", "- lights only g");
assert.equal(lit(segmentsFor(" ")), "", "space lights nothing");
assert.equal(lit(segmentsFor("Z")), "", "unsupported char lights nothing");

// Shape: always the 7 keys, always booleans.
const keys = Object.keys(segmentsFor("5")).sort().join("");
assert.equal(keys, "abcdefg", "returns exactly a..g");
assert.ok(Object.values(segmentsFor("9")).every((v) => typeof v === "boolean"), "all booleans");

console.log("sevenseg.test.mjs OK");
