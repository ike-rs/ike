/**
 * Utilities for formatting data.
 */
declare module '@std/format' {
  /**
   * ByteOptions for formatting byte values.
   */
  interface ByteOptions {
    /**
     * The number of decimal places to include in the formatted string.
     */
    decimalPlaces?: number;
    /**
     * Whether to always include the specified number of decimal places in the formatted string.
     */
    fixedDecimals?: boolean;
    /**
     * The character used as a thousands separator in the formatted string.
     */
    thousandsSeparator?: string | null;
    /**
     * The unit of measurement to include in the formatted string.
     */
    unit?: string;
    /**
     * The character used to separate the value and unit in the formatted string.
     */
    unitSeparator?: string | null;
  }

  /**
   * Converts a value in bytes to a human-readable string or parses a string to an integer in bytes.
   *
   * @param {string | number} value - The value to convert or parse.
   * @returns {string | number | null} - The formatted string or the parsed number in bytes.
   */
  export function convertBytes(
    value: string | number,
    options?: ByteOptions,
  ): string | number | null;

  /**
   * Formats a numeric value representing bytes into a human-readable string.
   *
   * @param {number} value - The value in bytes to format.
   * @returns {string | null} - The formatted string or `null` if the value is not a finite number.
   */
  export function formatBytes(
    value: number,
    options?: ByteOptions,
  ): string | null;

  /**
   * Parses a string representing a data size (e.g., '1KB', '5MB') into a numeric value in bytes.
   *
   * @param {number | string} val - The string or number to parse.
   * @returns {number | null} - The parsed value in bytes or `null` if parsing fails.
   */

  /**
   * Parses a string or number into a numeric value.
   *
   * @param {number | string} val - The string or number to parse.
   * @returns {number | null} - The parsed numeric value or `null` if parsing fails.
   */
  export function parseNumericValue(val: number | string): number | null;

  /**
   * Formats a string by replacing custom format markers with ANSI escape codes.
   *
   * Supported format markers:
   * - `<color>`: Applies the specified text color (e.g., `<red>`).
   * - `<r>`: Resets the text color to default.
   * - `\<`, `\>`: Escapes the angle brackets to be printed as is.
   *
   * Example:
   * ```ts
   * const result = prettyFmt("<red>Hello<r> <b>World<r>");
   * console.log(result);
   * ```
   *
   * @param {string} fmtStr - The string containing custom format markers.
   * @returns {string} The formatted string with ANSI escape codes.
   */
  export const prettyFmt: (fmtStr: string) => string;

  /**
   * Applies an ANSI style (modifier, color, or background color) to a string.
   *
   * Supported styles:
   * - Modifiers: `b` (bold), `d` (dim), `i` (italic), `u` (underline), `o` (overline), `inv` (inverse), `h` (hidden), `s` (strikethrough).
   * - Colors: `black`, `red`, `green`, `yellow`, `blue`, `magenta`, `cyan`, `white`, `gray`, `grey`, `blackBright`, `redBright`, `greenBright`, `yellowBright`, `blueBright`, `magentaBright`, `cyanBright`, `whiteBright`.
   * - Background Colors: `bgBlack`, `bgRed`, `bgGreen`, `bgYellow`, `bgBlue`, `bgMagenta`, `bgCyan`, `bgWhite`, `bgGray`, `bgGrey`, `bgBlackBright`, `bgRedBright`, `bgGreenBright`, `bgYellowBright`, `bgBlueBright`, `bgMagentaBright`, `bgCyanBright`, `bgWhiteBright`.
   *
   * Example:
   * ```ts
   * const result = applyStyle('red', 'Hello, World!');
   * console.log(result);
   * ```
   *
   * @param {string} style - The name of the style to apply (modifier, color, or background color).
   * @param {string} str - The string to which the style will be applied.
   * @returns {string} The string wrapped in the appropriate ANSI escape codes.
   */
  export const applyStyle: (style: string, str: string) => string;

  export const colors: {
    reset: (str: string) => string;
    bold: (str: string) => string;
    dim: (str: string) => string;
    italic: (str: string) => string;
    underline: (str: string) => string;
    overline: (str: string) => string;
    inverse: (str: string) => string;
    hidden: (str: string) => string;
    strikethrough: (str: string) => string;
    black: (str: string) => string;
    red: (str: string) => string;
    green: (str: string) => string;
    yellow: (str: string) => string;
    blue: (str: string) => string;
    magenta: (str: string) => string;
    cyan: (str: string) => string;
    white: (str: string) => string;
    blackBright: (str: string) => string;
    gray: (str: string) => string;
    grey: (str: string) => string;
    redBright: (str: string) => string;
    greenBright: (str: string) => string;
    yellowBright: (str: string) => string;
    blueBright: (str: string) => string;
    magentaBright: (str: string) => string;
    cyanBright: (str: string) => string;
    whiteBright: (str: string) => string;
    bgBlack: (str: string) => string;
    bgRed: (str: string) => string;
    bgGreen: (str: string) => string;
    bgYellow: (str: string) => string;
    bgBlue: (str: string) => string;
    bgMagenta: (str: string) => string;
    bgCyan: (str: string) => string;
    bgWhite: (str: string) => string;
    bgBlackBright: (str: string) => string;
    bgGray: (str: string) => string;
    bgGrey: (str: string) => string;
    bgRedBright: (str: string) => string;
    bgGreenBright: (str: string) => string;
    bgYellowBright: (str: string) => string;
    bgBlueBright: (str: string) => string;
    bgMagentaBright: (str: string) => string;
    bgCyanBright: (str: string) => string;
    bgWhiteBright: (str: string) => string;
  };

  export const RESET = '\x1b[0m';
}
