declare module '@std/uuid' {
  export const UUID_REGEX: RegExp;

  /**
   * Parses a UUID string into a Uint8Array.
   *
   * @param {string}
   * @returns {Uint8Array}
   * @throws {TypeError} If the UUID is invalid.
   */
  export const parse: (uuid: string) => Uint8Array;

  /**
   * Converts a Uint8Array into a UUID string.
   *
   * @param {Uint8Array}
   * @param {number} [offset=0]
   * @returns {string}
   * @throws {InvalidArgTypeError} If the UUID is not a Uint8Array.
   * @throws {RangeError} If the offset is not a non-negative integer.
   */
  export const stringify: (uuid: Uint8Array, offset?: number) => string;

  /**
   * Validates a UUID string.
   *
   * @param {string}
   * @returns {boolean}
   * @throws {TypeError} If the UUID is invalid.
   * @example
   * ```ts
   * import { validate } from '@std/uuid';
   *
   * validate('550e8400-e29b-41d4-a716-446655440000'); // true
   * ```
   */
  export const validate: (uuid: string) => boolean;

  /**
   * Generates a v4 UUID string.
   */
  export const uuidv4: () => string;

  /**
   * Generates a v5 UUID string.
   *
   * @param {string} namespace Can be a 'url', 'dns', 'oid', 'x500', or a custom namespace that is a string.
   * @param {string} name The name to generate the UUID for.
   * @returns {string}
   */
  export const uuidv5: (
    namespace: 'dns' | 'url' | 'oid' | 'x500' | (string & {}),
    name: string,
  ) => string;
}
