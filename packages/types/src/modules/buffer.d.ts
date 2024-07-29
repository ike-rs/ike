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
     * The `TextDecoder` class is used to decode a stream of bytes into a string, using a specified character encoding.
     */
    class TextDecoder {
      readonly encoding: string;
      readonly fatal: boolean;
      readonly ignoreBOM: boolean;

      /**
       * Creates a new `TextDecoder` object.
       * @param encoding The character encoding to use. If not specified, the default encoding is used.
       * @param options An object containing optional parameters:
       *   - `fatal`: A boolean indicating whether decoding errors should throw an error or replace the erroneous character. Default is `false`.
       *   - `ignoreBOM`: A boolean indicating whether to ignore the Byte Order Mark (BOM) when decoding. Default is `false`.
       */
      constructor(
        encoding?: string,
        options?: {
          fatal?: boolean | undefined;
          ignoreBOM?: boolean | undefined;
        }
      );

      /**
       * Decodes a stream of bytes into a string.
       * @param input The input data to be decoded. It can be an `ArrayBufferView`, `ArrayBuffer`, or `null`.
       * @param options An object containing optional parameters:
       *   - `stream`: A boolean indicating whether the input data is a stream. Default is `false`.
       * @returns The decoded string.
       */
      decode(
        input?: ArrayBufferView | ArrayBuffer | null,
        options?: { stream?: boolean | undefined }
      ): string;
    }
  }
  /**
   * Returns boolean based on whether the input contains only valid ASCII-encoded data.
   *
   * @throws TypeError If the input is detached.
   * @param input The input to check.
   */
  function isAscii(input: /** Buffer | */ ArrayBuffer | TypedArray): boolean;
  /**
   * Returns boolean based on whether the input contains only valid UTF-8-encoded data
   *
   * @throws TypeError If the input is detached.
   * @param input The input to check.
   */
  function isUtf8(input: /** Buffer | */ ArrayBuffer | TypedArray): boolean;

  export { TypedArray, atob, btoa, isAscii, isUtf8, TextEncoder };
}
