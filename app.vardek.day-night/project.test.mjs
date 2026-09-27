import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
// project() is defined inside index.html's script; mirror its formula here and
// assert the contract the renderer relies on. If index.html changes the formula,
// this test documents the expected mapping.
const project = (lon, lat, W, H) => ({ x: (lon + 180) / 360 * W, y: (90 - lat) / 180 * H });

const W = 2560, H = 720;
assert.deepEqual(project(-180, 90, W, H), { x: 0, y: 0 }, "top-left = (-180,90)");
assert.deepEqual(project(180, -90, W, H), { x: W, y: H }, "bottom-right = (180,-90)");
assert.deepEqual(project(0, 0, W, H), { x: W / 2, y: H / 2 }, "center = (0,0)");

// Guard that index.html actually contains a matching projection.
const html = readFileSync(new URL("./index.html", import.meta.url), "utf8");
assert.ok(/\(lon \+ 180\) \/ 360 \* W/.test(html), "index.html uses the x projection");
assert.ok(/\(90 - lat\) \/ 180 \* H/.test(html), "index.html uses the y projection");
console.log("project.test.mjs OK");
