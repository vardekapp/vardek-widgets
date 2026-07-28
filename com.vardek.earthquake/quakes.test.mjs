import assert from "node:assert/strict";
import "./quakes.js";
const { parseQuakes, magRadius, project } = globalThis.Quakes;
const gj = { features: [
  { properties:{mag:4.8, place:"10 km WNW of X", time:1785247316881}, geometry:{coordinates:[130.494,32.5384,9.3]} },
  { properties:{mag:2.5, place:"Y", time:1785200000000}, geometry:{coordinates:[-118.1,34.0,5]} },
  { properties:{mag:null, place:"bad"}, geometry:null }, // malformed -> dropped
]};
const q = parseQuakes(gj);
assert.equal(q.length, 2, "drops malformed");
assert.deepEqual({lat:q[0].lat, lon:q[0].lon, mag:q[0].mag}, {lat:32.5384, lon:130.494, mag:4.8});
assert.ok(magRadius(5) > magRadius(2), "radius grows with magnitude");
assert.deepEqual(project(-180,90,2560,720), {x:0,y:0});
assert.deepEqual(project(180,-90,2560,720), {x:2560,y:720});
console.log("quakes.test.mjs OK");
