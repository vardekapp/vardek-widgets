// Pure helper for the Space Launch Schedule widget. Classic script (no export),
// exposes globalThis.Launches for both index.html and launches.test.mjs.
(function () {
  function parseLaunches(json) {
    const results = (json && Array.isArray(json.results)) ? json.results : [];
    const out = [];
    for (const r of results) {
      if (!r) continue;
      const netMs = Date.parse(r.net);
      if (!Number.isFinite(netMs)) continue;
      out.push({
        name: r.name || "",
        provider: r.lsp_name || "",
        netMs,
        pad: r.pad || "",
      });
    }
    return out;
  }

  function pad2(n) {
    return String(n).padStart(2, "0");
  }

  function formatCountdown(msRemaining) {
    if (msRemaining <= 0) return "LIFTOFF";
    const totalSec = Math.floor(msRemaining / 1000);
    const days = Math.floor(totalSec / 86400);
    const hours = Math.floor((totalSec % 86400) / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    const secs = totalSec % 60;
    const hms = `${pad2(hours)}:${pad2(mins)}:${pad2(secs)}`;
    return days > 0 ? `${days}d ${hms}` : hms;
  }

  globalThis.Launches = { parseLaunches, formatCountdown };
})();
