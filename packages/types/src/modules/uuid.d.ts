declare module '@std/uuid' {
  /**
   * Parses a UUID string into a Uint8Array.
   *
   * @param {string}
   * @returns {Uint8Array}
   * @throws {TypeError} If the UUID is invalid.
   */
  export const parse: (uuid: string) => Uint8Array;
}
