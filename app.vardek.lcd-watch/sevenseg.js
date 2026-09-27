// Seven-segment display map. Classic script (NOT an ES module): widgets load in
// an opaque-origin sandbox where type=module external scripts are CORS-blocked.
// segmentsFor(char) -> { a,b,c,d,e,f,g } booleans (lit segments).
//
//   aaa
//  f   b
//  f   b
//   ggg
//  e   c
//  e   c
//   ddd
const MAP = {
  "0": "abcdef",
  "1": "bc",
  "2": "abdeg",
  "3": "abcdg",
  "4": "bcfg",
  "5": "acdfg",
  "6": "acdefg",
  "7": "abc",
  "8": "abcdefg",
  "9": "abcdfg",
  "-": "g",
  " ": "",
};

function segmentsFor(char) {
  const lit = MAP[char] || "";
  return {
    a: lit.includes("a"), b: lit.includes("b"), c: lit.includes("c"),
    d: lit.includes("d"), e: lit.includes("e"), f: lit.includes("f"),
    g: lit.includes("g"),
  };
}

globalThis.SevenSeg = { segmentsFor };
