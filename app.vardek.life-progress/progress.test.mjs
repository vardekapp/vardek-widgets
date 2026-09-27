import assert from "node:assert/strict";
import "./progress.js";
const { progressData } = globalThis.Progress;
const all = { showLife:true, showYear:true, showMonth:true, showWeek:true, showDay:true, birthDate:"1990-01-01", lifeExpectancy:80 };

// Jan 1 00:00 local -> year fraction ~0
const jan1 = new Date(2025,0,1,0,0,0).getTime();
let y = progressData(jan1, all).find(b=>b.key==="year");
assert.ok(y.fraction < 0.01, `year ~0 at Jan 1, got ${y.fraction}`);
// Dec 31 23:59 local -> year fraction ~1
const dec31 = new Date(2025,11,31,23,59,0).getTime();
y = progressData(dec31, all).find(b=>b.key==="year");
assert.ok(y.fraction > 0.99, `year ~1 at Dec 31, got ${y.fraction}`);
// all fractions in [0,1]
for (const b of progressData(jan1, all)) assert.ok(b.fraction>=0 && b.fraction<=1, `${b.key} in range`);
// life fraction = age/expectancy: born 40y ago, exp 80 -> ~0.5
const born = new Date(1985,0,1).getTime(); const now2 = new Date(2025,0,1).getTime();
const life = progressData(now2, {...all, birthDate:"1985-01-01"}).find(b=>b.key==="life");
assert.ok(Math.abs(life.fraction - 40/80) < 0.02, `life ~0.5, got ${life.fraction}`);
// filtering
assert.equal(progressData(jan1, {...all, showWeek:false}).some(b=>b.key==="week"), false);
console.log("progress.test.mjs OK");
