// Pure helper: computes fractional progress bars (life/year/month/week/day)
// from local wall-clock time. No network, no DOM. Classic script global.

function clamp01(x) {
  return x < 0 ? 0 : x > 1 ? 1 : x;
}

const WEEKDAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function ageYearsFraction(birthDate, now) {
  const born = new Date(birthDate);
  if (isNaN(born.getTime())) return 0;
  const msPerYear = 365.2425 * 86400000;
  return (now.getTime() - born.getTime()) / msPerYear;
}

function lifeBar(cfg, now) {
  const ageYears = ageYearsFraction(cfg.birthDate, now);
  const fraction = clamp01(cfg.lifeExpectancy > 0 ? ageYears / cfg.lifeExpectancy : 0);
  const ageWhole = Math.max(0, Math.floor(ageYears));
  return { key: "life", label: "Life", fraction, detail: `${ageWhole} / ${cfg.lifeExpectancy} yrs` };
}

function yearBar(now) {
  const start = new Date(now.getFullYear(), 0, 1);
  const nextStart = new Date(now.getFullYear() + 1, 0, 1);
  const fraction = clamp01((now - start) / (nextStart - start));
  const daysLeft = Math.ceil((nextStart - now) / 86400000);
  return { key: "year", label: "Year", fraction, detail: `${daysLeft} days left` };
}

function monthBar(now) {
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const nextStart = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const fraction = clamp01((now - start) / (nextStart - start));
  const daysLeft = Math.ceil((nextStart - now) / 86400000);
  return { key: "month", label: "Month", fraction, detail: `${daysLeft} days left` };
}

function weekBar(now) {
  // Monday-start week.
  const dow = now.getDay(); // 0=Sun..6=Sat
  const daysSinceMonday = (dow + 6) % 7;
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - daysSinceMonday);
  const nextStart = new Date(start.getFullYear(), start.getMonth(), start.getDate() + 7);
  const fraction = clamp01((now - start) / (nextStart - start));
  return { key: "week", label: "Week", fraction, detail: WEEKDAY_NAMES[dow] };
}

function dayBar(now) {
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const fraction = clamp01((now - start) / 86400000);
  const hh = String(now.getHours()).padStart(2, "0");
  const mm = String(now.getMinutes()).padStart(2, "0");
  return { key: "day", label: "Day", fraction, detail: `${hh}:${mm}` };
}

function progressData(nowMs, cfg) {
  const now = new Date(nowMs);
  const bars = [];
  if (cfg.showLife) bars.push(lifeBar(cfg, now));
  if (cfg.showYear) bars.push(yearBar(now));
  if (cfg.showMonth) bars.push(monthBar(now));
  if (cfg.showWeek) bars.push(weekBar(now));
  if (cfg.showDay) bars.push(dayBar(now));
  return bars;
}

globalThis.Progress = { progressData };
