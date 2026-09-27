import assert from "node:assert/strict";
import "./quakes.js";
const { parseQuakes, magRadius, project, magColor } = globalThis.Quakes;
const gj = { features: [
  { properties:{mag:4.8, place:"10 km WNW of X", time:1785247316881}, geometry:{coordinates:[130.494,32.5384,9.3]} },
  { properties:{mag:2.5, place:"Y", time:1785200000000}, geometry:{coordinates:[-118.1,34.0,5]} },
  { properties:{mag:null, place:"bad"}, geometry:null }, // malformed -> dropped
]};
const q = parseQuakes(gj);
assert.equal(q.length, 2, "drops malformed");
assert.deepEqual({lat:q[0].lat, lon:q[0].lon, mag:q[0].mag}, {lat:32.5384, lon:130.494, mag:4.8});
assert.equal(q[0].depth, 9.3, "parses depth from coordinates[2]");
assert.ok(magRadius(5) > magRadius(2), "radius grows with magnitude");
assert.deepEqual(project(-180,90,2560,720), {x:0,y:0});
assert.deepEqual(project(180,-90,2560,720), {x:2560,y:720});
assert.equal(magColor(2.9), "#3ad16b");
assert.equal(magColor(3.0), "#ffd60a");
assert.equal(magColor(4.5), "#ff9f0a");
assert.equal(magColor(5.9), "#ff453a");
assert.equal(magColor(7.1), "#ff2d95");
console.log("quakes.test.mjs OK");
