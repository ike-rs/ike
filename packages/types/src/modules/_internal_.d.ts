declare module '_internal_' {
  /**
   * Checks if a value is a typed array.
   *
   * @param value - The value to check.
   * @returns `true` if the value is a typed array, `false` otherwise.
   */
  export const isTypedArray: (value: any) => value is TypedArray;

  /**
   * Checks if a value is an array buffer or a shared array buffer.
   *
   * @param value - The value to check.
   * @returns `true` if the value is an array buffer, `false` otherwise.
   */
  export const isArrayBuffer: (
    value: any,
  ) => value is ArrayBuffer | SharedArrayBuffer;

  export const InvalidArgTypeError: new (
    message: string,
    expected: string | string[],
    actual: unknown,
  ) => Error;
}
