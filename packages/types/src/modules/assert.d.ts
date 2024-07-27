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
  export const assertEquals: <T = any>(
    actual: T,
    expected: T,
    msg: string
  ) => void;

  /**
   * Asserts that a condition is true.
   * If the assertion fails, throws an AssertionError with a detailed message.
   *
   * @param {boolean}
   * @param {string} msg - The custom error message to be included if the assertion fails.
   * @throws {AssertionError} If the condition is false.
   * @example
   * assert(true, "This should pass");
   * assert(false, "This should fail");
   */
  export const assert: (condition: boolean, msg: string) => void;

  /**
   * Asserts that the actual value is not equal to the expected value.
   * If the assertion fails, throws an AssertionError with a detailed message.
   *
   * @param {*} actual - The actual value to be tested.
   * @param {*} expected - The expected value to compare against.
   * @param {string}
   * @throws {AssertionError} If the actual value equals the expected value.
   * @example
   * assertNotEquals(1, 2, "This should pass");
   * assertNotEquals(1, 1, "This should fail");
   */
  export const assertNotEquals: <T = any>(
    actual: T,
    expected: T,
    msg: string
  ) => void;
}
