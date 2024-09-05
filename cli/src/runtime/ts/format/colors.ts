export const CODES: Record<string, [number, number]> = {
  // Modifiers
  b: [1, 22], // bold
  bold: [1, 22], // bold
  d: [2, 22], // dim
  dim: [2, 22], // dim
  i: [3, 23], // italic
  italic: [3, 23], // italic
  u: [4, 24], // underline
  underline: [4, 24], // underline
  o: [53, 55], // overline
  overline: [53, 55], // overline
  inv: [7, 27], // inverse
  inverse: [7, 27], // inverse
  h: [8, 28], // hidden
  hidden: [8, 28], // hidden
  s: [9, 29], // strikethrough
  strikethrough: [9, 29], // strikethrough

  // Colors
  black: [30, 39],
  red: [31, 39],
  green: [32, 39],
  yellow: [33, 39],
  blue: [34, 39],
  magenta: [35, 39],
  cyan: [36, 39],
  white: [37, 39],
  gray: [90, 39], // grey
  grey: [90, 39],

  // Bright colors
  blackBright: [90, 39],
  redBright: [91, 39],
  greenBright: [92, 39],
  yellowBright: [93, 39],
  blueBright: [94, 39],
  magentaBright: [95, 39],
  cyanBright: [96, 39],
  whiteBright: [97, 39],

  // Background colors
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

  // Bright background colors
  bgBlackBright: [100, 49],
  bgRedBright: [101, 49],
  bgGreenBright: [102, 49],
  bgYellowBright: [103, 49],
  bgBlueBright: [104, 49],
  bgMagentaBright: [105, 49],
  bgCyanBright: [106, 49],
  bgWhiteBright: [107, 49],
};

export const colorCodes = CODES;

export const RESET = '\x1b[0m';

export const prettyFmt = (fmtStr: string): string => {
  let newFmt = '';
  let i = 0;

  while (i < fmtStr.length) {
    const c = fmtStr[i];

    if (c === '\\') {
      const nextChar = fmtStr[i + 1];
      if (nextChar === '<' || nextChar === '>') {
        newFmt += nextChar;
        i += 2;
      } else {
        newFmt += '\\' + nextChar;
        i += 2;
      }
    } else if (c === '>') {
      // Skip '>'
      i += 1;
    } else if (c === '{') {
      newFmt += '{';
      i += 1;
      while (i < fmtStr.length && fmtStr[i] !== '}') {
        newFmt += fmtStr[i];
        i += 1;
      }
      if (i < fmtStr.length) {
        newFmt += '}';
        i += 1;
      }
    } else if (c === '<') {
      let isReset = fmtStr[i + 1] === '/';
      if (isReset) i += 1;

      let colorName = '';
      i += 1;
      while (i < fmtStr.length && fmtStr[i] !== '>') {
        colorName += fmtStr[i];
        i += 1;
      }
      i += 1; // Skip '>'

      let colorStr = colorName == 'r' ? RESET : `\x1b[${CODES[colorName][0]}m`;

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

export const applyStyle = (style: string, str: string): string => {
  const codes = CODES[style] || [];
  return `\x1b[${codes[0]}m${str}\x1b[${codes[1]}m`;
};

export const colors = {
  reset: (str: string) => applyStyle('r', str),
  bold: (str: string) => applyStyle('b', str),
  dim: (str: string) => applyStyle('d', str),
  italic: (str: string) => applyStyle('i', str),
  underline: (str: string) => applyStyle('u', str),
  overline: (str: string) => applyStyle('o', str),
  inverse: (str: string) => applyStyle('inv', str),
  hidden: (str: string) => applyStyle('h', str),
  strikethrough: (str: string) => applyStyle('s', str),

  black: (str: string) => applyStyle('black', str),
  red: (str: string) => applyStyle('red', str),
  green: (str: string) => applyStyle('green', str),
  yellow: (str: string) => applyStyle('yellow', str),
  blue: (str: string) => applyStyle('blue', str),
  magenta: (str: string) => applyStyle('magenta', str),
  cyan: (str: string) => applyStyle('cyan', str),
  white: (str: string) => applyStyle('white', str),
  blackBright: (str: string) => applyStyle('blackBright', str),
  gray: (str: string) => applyStyle('gray', str),
  grey: (str: string) => applyStyle('grey', str),
  redBright: (str: string) => applyStyle('redBright', str),
  greenBright: (str: string) => applyStyle('greenBright', str),
  yellowBright: (str: string) => applyStyle('yellowBright', str),
  blueBright: (str: string) => applyStyle('blueBright', str),
  magentaBright: (str: string) => applyStyle('magentaBright', str),
  cyanBright: (str: string) => applyStyle('cyanBright', str),
  whiteBright: (str: string) => applyStyle('whiteBright', str),

  bgBlack: (str: string) => applyStyle('bgBlack', str),
  bgRed: (str: string) => applyStyle('bgRed', str),
  bgGreen: (str: string) => applyStyle('bgGreen', str),
  bgYellow: (str: string) => applyStyle('bgYellow', str),
  bgBlue: (str: string) => applyStyle('bgBlue', str),
  bgMagenta: (str: string) => applyStyle('bgMagenta', str),
  bgCyan: (str: string) => applyStyle('bgCyan', str),
  bgWhite: (str: string) => applyStyle('bgWhite', str),
  bgBlackBright: (str: string) => applyStyle('bgBlackBright', str),
  bgGray: (str: string) => applyStyle('bgGray', str),
  bgGrey: (str: string) => applyStyle('bgGrey', str),
  bgRedBright: (str: string) => applyStyle('bgRedBright', str),
  bgGreenBright: (str: string) => applyStyle('bgGreenBright', str),
  bgYellowBright: (str: string) => applyStyle('bgYellowBright', str),
  bgBlueBright: (str: string) => applyStyle('bgBlueBright', str),
  bgMagentaBright: (str: string) => applyStyle('bgMagentaBright', str),
  bgCyanBright: (str: string) => applyStyle('bgCyanBright', str),
  bgWhiteBright: (str: string) => applyStyle('bgWhiteBright', str),
};

export type Rgb = {
  r: number;
  g: number;
  b: number;
};

export const textRgb = (text: string, rgb: Rgb): string => {
  return `\x1b[38;2;${rgb.r};${rgb.g};${rgb.b}m${text}\x1b[0m`;
};

export const backgroundRgb = (text: string, rgb: Rgb): string => {
  return `\x1b[48;2;${rgb.r};${rgb.g};${rgb.b}m${text}\x1b[0m`;
};

export const hexToRgb = (hex: string): Rgb => {
  const value = hex.startsWith('#') ? hex.slice(1) : hex;
  const bigint = parseInt(value, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;

  return { r, g, b };
};

export const textHex = (text: string, hex: string): string => {
  const rgb = hexToRgb(hex);
  return textRgb(text, rgb);
};

export const backgroundHex = (text: string, hex: string): string => {
  const rgb = hexToRgb(hex);
  return backgroundRgb(text, rgb);
};
