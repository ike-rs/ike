/**
 * Represents the Headers class which provides methods to manipulate HTTP headers.
 */
export class Headers {
  headers: HeadersMap;

  constructor(input: Record<string, string> | Array<[string, string]>);

  /**
   * Appends a new value onto an existing header inside a Headers object.
   * If the header already exists, the new value is appended to the existing value.
   * For the 'set-cookie' header, the value is pushed to an array of values.
   * @throws TypeError - If the header name is not a valid HTTP header
   * @param key - The name of the header to append to.
   * @param value - The value to append to the header.
   */
  append(key: string, value: string): void;

  /**
   * Deletes a header from the Headers object.
   * @param key - The name of the header to delete.
   */
  delete(key: string): void;

  /**
   * Returns the value of the specified header.
   * If there are multiple values for a header, returns a comma-separated string.
   * @param key - The name of the header to retrieve.
   * @returns The value of the header as a string, or `undefined` if the header does not exist.
   */
  get(key: string): string | undefined;

  /**
   * Returns the value of the 'set-cookie' header.
   * @returns The values of the 'set-cookie' header as an array of strings, or `undefined` if the header does not exist.
   */
  getSetCookie(): string[] | undefined;

  /**
   * Checks if the Headers object contains a specific header.
   * @param key - The name of the header to check for.
   * @returns True if the header exists, otherwise false.
   */
  has(key: string): boolean;

  /**
   * Sets a new value for the specified header, replacing any existing values.
   * @throws TypeError - If the header name is not a valid HTTP header
   * @param key - The name of the header to set.
   * @param value - The value to set for the header.
   */
  set(key: string, value: string): void;
}

/**
 * Represents a map of headers.
 */
export type HeadersMap = { [key: string]: string | string[] };
