declare module "buffer" {
  global {
    type TypedArray =
      | Int8Array
      | Uint8Array
      | Uint8ClampedArray
      | Int16Array
      | Uint16Array
      | Int32Array
      | Uint32Array
      | Float32Array
      | Float64Array;

    /**
     * Decodes a string of base64 data into bytes, and encodes those bytes into a Latin-1 string.
     *
     * @warning This function is not supposed to be used. It is only here for compatibility with the browser's `atob` function. Use `Buffer.from(base64, "base64")` instead.
     *
     * @param base64 A string of base64 data to decode.
     * @returns A string of Latin-1 data.
     *
     * @example
     * ```ts
     * const decoded = atob("SGVsbG8gV29ybGQh");
     * console.log(decoded); // "Hello World!"
     * ```
     */
    function atob(base64: string): string;
    /**
     * Encodes a string of Latin-1 data into bytes, and encodes those bytes into a base64 string.
     *
     * @warning This function is not supposed to be used. It is only here for compatibility with the browser's `btoa` function. Use `Buffer.from(str, 'base64')` instead.
     *
     * @param input A string of Latin-1 data to encode.
     * @returns A string of base64 data.
     *
     * @example
     * ```ts
     * const encoded = btoa("Hello World!");
     * console.log(encoded); // "SGVsbG8gV29ybGQh"
     * ```
     */
    function btoa(input: string): string;
    /**
     * Returns boolean based on whether the input contains only valid ASCII-encoded data.
     *
     * @throws TypeError If the input is detached.
     * @param input The input to check.
     */
    function isAscii(input: Buffer | ArrayBuffer | TypedArray): boolean;
  }
}
