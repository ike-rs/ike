declare module 'buffer' {
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
       * @param encoding The character encoding to use. If not specified, the default encoding is used (typically 'utf-8').
       * @param options An object containing optional parameters:
       *   - `fatal`: A boolean indicating whether decoding errors should throw an error (true) or replace the erroneous character with a replacement character (false). Default is `false`.
       *   - `ignoreBOM`: A boolean indicating whether to ignore the Byte Order Mark (BOM) when decoding. Default is `false`.
       * @example
       * const decoder = new TextDecoder('utf-8', { fatal: true, ignoreBOM: true });
       */
      constructor(
        encoding?: string,
        options?: {
          fatal?: boolean | undefined;
          ignoreBOM?: boolean | undefined;
        },
      );

      /**
       * Decodes a stream of bytes into a string.
       * @param input The input data to be decoded. It can be an `ArrayBufferView` (such as `Uint8Array`), `ArrayBuffer`, or `null`.
       * @param options An object containing optional parameters:
       *   - `stream`: A boolean indicating whether the input data is a stream. If true, the decoder maintains the state between calls to `decode()`. Default is `false`.
       * @returns The decoded string.
       * @example
       * const input = new Uint8Array([72, 101, 108, 108, 111]);
       * const decoder = new TextDecoder('utf-8');
       * const output = decoder.decode(input);
       * console.log(output); // "Hello"
       */
      decode(
        input?: ArrayBufferView | ArrayBuffer | null,
        options?: { stream?: boolean | undefined },
      ): string;
    }

    /**
     * The `TextEncoder` class is used to encode a string into bytes.
     * The encoding used is always 'utf-8'.
     */
    class TextEncoder {
      static readonly encoding: 'utf-8';

      /**
       * Creates a new `TextEncoder` object.
       * @example
       * const encoder = new TextEncoder();
       */
      constructor();

      /**
       * Encodes a string into bytes.
       * @param input The string to be encoded.
       * @returns A `Uint8Array` containing the encoded bytes.
       * @example
       * const encoder = new TextEncoder();
       * const output = encoder.encode("Hello");
       * console.log(output); // Uint8Array([72, 101, 108, 108, 111])
       */
      encode(input: string): Uint8Array;

      /**
       * Encodes a string into bytes, and writes the result into the specified buffer.
       * This method is useful when you want to reuse an existing buffer for performance reasons.
       * @param input The string to be encoded.
       * @param output The buffer to write the result into. Must be a `Uint8Array`.
       * @returns An object containing two properties:
       *   - `read`: The number of characters read from the input string.
       *   - `written`: The number of bytes written to the output buffer.
       * @example
       * const encoder = new TextEncoder();
       * const buffer = new Uint8Array(5);
       * const result = encoder.encodeInto("Hello", buffer);
       * console.log(result); // { read: 5, written: 5 }
       * console.log(buffer); // Uint8Array([72, 101, 108, 108, 111])
       */
      encodeInto(
        input: string,
        output: Uint8Array,
      ): { read: number; written: number };
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

  export { TypedArray, atob, btoa, isAscii, isUtf8 };
}
