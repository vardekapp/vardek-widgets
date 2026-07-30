// Lava lamp palettes + tuning helpers. CLASSIC script (opaque-origin sandbox
// blocks ES modules). Wrapped in an IIFE so nothing leaks into the shared global
// scope (a top-level `function palette(){}` here would collide with a widget's
// own `const palette` — classic scripts all share one global lexical scope).
// Exposes only globalThis.Lava; Node-testable via side-effect import.
(function () {
  const PALETTES = {
    classic: ["#ff2d00", "#ff6a00", "#ffb300"], // 70s red → orange → gold
    aqua:    ["#00e5ff", "#0a84ff", "#5e5cff"], // cyan → blue → indigo
    toxic:   ["#39ff14", "#7cfc00", "#c6ff00"], // radioactive greens
    sunset:  ["#ff2d95", "#ff6ec7", "#a020f0"], // pink → magenta → purple
    ember:   ["#ff1a00", "#ff4d00", "#ff8c00"], // hot coals
    mono:    ["#e6e9ef", "#9aa6c0", "#6b7492"], // grayscale
  };

  function palette(scheme) {
    return PALETTES[scheme] || PALETTES.classic;
  }

  // Animation speed multiplier.
  function speedFactor(s) {
    return s === "slow" ? 0.55 : s === "fast" ? 1.9 : 1.0;
  }

  // Number of blobs per density setting.
  function blobCount(d) {
    return d === "few" ? 7 : d === "many" ? 18 : 12;
  }

  globalThis.Lava = { palette, speedFactor, blobCount, PALETTES };
})();
