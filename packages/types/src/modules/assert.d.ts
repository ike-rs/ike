declare module "assert" {
  /**
   * Custom error class for assertion errors.
   * @class
   * @extends {Error}
   */
  export class AssertionError extends Error {
    /**
     * Creates an instance of AssertionError.
     * @param {string} message - The error message.
     */
    constructor(message: string);
  }

  /**
   * Asserts that the actual value is equal to the expected value.
   * If the assertion fails, throws an AssertionError with a detailed message.
   *
   * @param {*} actual - The actual value to be tested.
   * @param {*} expected - The expected value to compare against.
   * @param {string} msg - The custom error message to be included if the assertion fails.
   * @throws {AssertionError} If the actual value does not equal the expected value.
   */
  export const assert: <T>(actual: T, expected: T, msg: string) => void;
}
