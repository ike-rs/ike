declare module '@std/buffer' {
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
