// @bun
// ike/src/runtime/ts/format/bytes.ts
var formatThousandsRegExp = /\B(?=(\d{3})+(?!\d))/g;
var formatDecimalsRegExp = /(?:\.0*|(\.[^0]+)0+)$/;
var map = {
  b: 1,
  kb: 1 << 10,
  mb: 1 << 20,
  gb: 1 << 30,
  tb: Math.pow(1024, 4),
  pb: Math.pow(1024, 5)
};
var parseRegExp = /^((-|\+)?(\d+(?:\.\d+)?)) *(kb|mb|gb|tb|pb)$/i;
var convertBytes = (value, options) => {
  if (typeof value === "string") {
    return parseNumericValue(value);
  }
  if (typeof value === "number") {
    return formatBytes(value, options);
  }
  return null;
};
var formatBytes = (value, options) => {
  if (!Number.isFinite(value)) {
    return null;
  }
  const mag = Math.abs(value);
  const thousandsSeparator = options?.thousandsSeparator || "";
  const unitSeparator = options?.unitSeparator || "";
  const decimalPlaces = options?.decimalPlaces !== undefined ? options.decimalPlaces : 2;
  const fixedDecimals = Boolean(options?.fixedDecimals);
  let unit = options?.unit || "";
  if (!unit || !map[unit.toLowerCase()]) {
    if (mag >= map.pb) {
      unit = "PB";
    } else if (mag >= map.tb) {
      unit = "TB";
    } else if (mag >= map.gb) {
      unit = "GB";
    } else if (mag >= map.mb) {
      unit = "MB";
    } else if (mag >= map.kb) {
      unit = "KB";
    } else {
      unit = "B";
    }
  }
  const val = value / map[unit.toLowerCase()];
  let str = val.toFixed(decimalPlaces);
  if (!fixedDecimals) {
    str = str.replace(formatDecimalsRegExp, "$1");
  }
  if (thousandsSeparator) {
    str = str.split(".").map((s, i) => i === 0 ? s.replace(formatThousandsRegExp, thousandsSeparator) : s).join(".");
  }
  return str + unitSeparator + unit;
};
var parseNumericValue = (val) => {
  if (typeof val === "number" && !isNaN(val)) {
    return val;
  }
  if (typeof val !== "string") {
    return null;
  }
  const results = parseRegExp.exec(val);
  let floatValue;
  let unit = "b";
  if (!results) {
    floatValue = parseInt(val, 10);
    unit = "b";
  } else {
    floatValue = parseFloat(results[1]);
    unit = results[4].toLowerCase();
  }
  if (isNaN(floatValue)) {
    return null;
  }
  return Math.floor(map[unit] * floatValue);
};
// ike/src/runtime/ts/format/colors.ts
var CODES = {
  b: [1, 22],
  d: [2, 22],
  i: [3, 23],
  u: [4, 24],
  o: [53, 55],
  inv: [7, 27],
  h: [8, 28],
  s: [9, 29],
  black: [30, 39],
  red: [31, 39],
  green: [32, 39],
  yellow: [33, 39],
  blue: [34, 39],
  magenta: [35, 39],
  cyan: [36, 39],
  white: [37, 39],
  gray: [90, 39],
  grey: [90, 39],
  blackBright: [90, 39],
  redBright: [91, 39],
  greenBright: [92, 39],
  yellowBright: [93, 39],
  blueBright: [94, 39],
  magentaBright: [95, 39],
  cyanBright: [96, 39],
  whiteBright: [97, 39],
  bgBlack: [40, 49],
  bgRed: [41, 49],
  bgGreen: [42, 49],
  bgYellow: [43, 49],
  bgBlue: [44, 49],
  bgMagenta: [45, 49],
  bgCyan: [46, 49],
  bgWhite: [47, 49],
  bgGray: [100, 49],
  bgGrey: [100, 49],
  bgBlackBright: [100, 49],
  bgRedBright: [101, 49],
  bgGreenBright: [102, 49],
  bgYellowBright: [103, 49],
  bgBlueBright: [104, 49],
  bgMagentaBright: [105, 49],
  bgCyanBright: [106, 49],
  bgWhiteBright: [107, 49]
};
var RESET = "\x1B[0m";
var prettyFmt = (fmtStr) => {
  let newFmt = "";
  let i = 0;
  while (i < fmtStr.length) {
    const c = fmtStr[i];
    if (c === "\\") {
      const nextChar = fmtStr[i + 1];
      if (nextChar === "<" || nextChar === ">") {
        newFmt += nextChar;
        i += 2;
      } else {
        newFmt += "\\" + nextChar;
        i += 2;
      }
    } else if (c === ">") {
      i += 1;
    } else if (c === "{") {
      newFmt += "{";
      i += 1;
      while (i < fmtStr.length && fmtStr[i] !== "}") {
        newFmt += fmtStr[i];
        i += 1;
      }
      if (i < fmtStr.length) {
        newFmt += "}";
        i += 1;
      }
    } else if (c === "<") {
      let isReset = fmtStr[i + 1] === "/";
      if (isReset)
        i += 1;
      let colorName = "";
      i += 1;
      while (i < fmtStr.length && fmtStr[i] !== ">") {
        colorName += fmtStr[i];
        i += 1;
      }
      i += 1;
      let colorStr = colorName == "r" ? RESET : `\x1B[${CODES[colorName][0]}m`;
      if (isReset) {
        newFmt += RESET;
      } else {
        newFmt += colorStr;
      }
    } else {
      newFmt += c;
      i += 1;
    }
  }
  return newFmt;
};
var applyStyle = (style, str) => {
  const codes = CODES[style] || [];
  return `\x1B[${codes[0]}m${str}\x1B[${codes[1]}m`;
};
var colors = {
  reset: (str) => applyStyle("r", str),
  bold: (str) => applyStyle("b", str),
  dim: (str) => applyStyle("d", str),
  italic: (str) => applyStyle("i", str),
  underline: (str) => applyStyle("u", str),
  overline: (str) => applyStyle("o", str),
  inverse: (str) => applyStyle("inv", str),
  hidden: (str) => applyStyle("h", str),
  strikethrough: (str) => applyStyle("s", str),
  black: (str) => applyStyle("black", str),
  red: (str) => applyStyle("red", str),
  green: (str) => applyStyle("green", str),
  yellow: (str) => applyStyle("yellow", str),
  blue: (str) => applyStyle("blue", str),
  magenta: (str) => applyStyle("magenta", str),
  cyan: (str) => applyStyle("cyan", str),
  white: (str) => applyStyle("white", str),
  blackBright: (str) => applyStyle("blackBright", str),
  gray: (str) => applyStyle("gray", str),
  grey: (str) => applyStyle("grey", str),
  redBright: (str) => applyStyle("redBright", str),
  greenBright: (str) => applyStyle("greenBright", str),
  yellowBright: (str) => applyStyle("yellowBright", str),
  blueBright: (str) => applyStyle("blueBright", str),
  magentaBright: (str) => applyStyle("magentaBright", str),
  cyanBright: (str) => applyStyle("cyanBright", str),
  whiteBright: (str) => applyStyle("whiteBright", str),
  bgBlack: (str) => applyStyle("bgBlack", str),
  bgRed: (str) => applyStyle("bgRed", str),
  bgGreen: (str) => applyStyle("bgGreen", str),
  bgYellow: (str) => applyStyle("bgYellow", str),
  bgBlue: (str) => applyStyle("bgBlue", str),
  bgMagenta: (str) => applyStyle("bgMagenta", str),
  bgCyan: (str) => applyStyle("bgCyan", str),
  bgWhite: (str) => applyStyle("bgWhite", str),
  bgBlackBright: (str) => applyStyle("bgBlackBright", str),
  bgGray: (str) => applyStyle("bgGray", str),
  bgGrey: (str) => applyStyle("bgGrey", str),
  bgRedBright: (str) => applyStyle("bgRedBright", str),
  bgGreenBright: (str) => applyStyle("bgGreenBright", str),
  bgYellowBright: (str) => applyStyle("bgYellowBright", str),
  bgBlueBright: (str) => applyStyle("bgBlueBright", str),
  bgMagentaBright: (str) => applyStyle("bgMagentaBright", str),
  bgCyanBright: (str) => applyStyle("bgCyanBright", str),
  bgWhiteBright: (str) => applyStyle("bgWhiteBright", str)
};
var textRgb = (text, rgb) => {
  return `\x1B[38;2;${rgb.r};${rgb.g};${rgb.b}m${text}\x1B[0m`;
};
var backgroundRgb = (text, rgb) => {
  return `\x1B[48;2;${rgb.r};${rgb.g};${rgb.b}m${text}\x1B[0m`;
};
var hexToRgb = (hex) => {
  const value = hex.startsWith("#") ? hex.slice(1) : hex;
  const bigint = parseInt(value, 16);
  const r = bigint >> 16 & 255;
  const g = bigint >> 8 & 255;
  const b = bigint & 255;
  return { r, g, b };
};
var textHex = (text, hex) => {
  const rgb = hexToRgb(hex);
  return textRgb(text, rgb);
};
var backgroundHex = (text, hex) => {
  const rgb = hexToRgb(hex);
  return backgroundRgb(text, rgb);
};
export {
  textRgb,
  textHex,
  prettyFmt,
  parseNumericValue,
  hexToRgb,
  formatBytes,
  convertBytes,
  colors,
  backgroundRgb,
  backgroundHex,
  applyStyle,
  RESET
};
