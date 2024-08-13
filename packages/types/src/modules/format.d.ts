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
}
