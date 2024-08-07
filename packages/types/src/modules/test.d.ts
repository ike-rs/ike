declare module 'test' {
  /**
   * Describes a group of tests.
   *
   * @param group The name of the group.
   * @param fn The function that contains the tests.
   */
  function describe(group: string, fn: () => void): void;

  /**
   * Describes a test.
   *
   * @param test The name of the test.
   * @param fn The function that contains the test.
   */
  const it: {
    (test: string, fn: () => void): void;
    /**
     * Skips a test, and marks it as todo.
     * @param test The name of the test.
     * @param fn The function that contains the test.
     */
    todo: (test: string, fn: () => void) => void;
    /**
     * Skips a test.
     *
     * @param test The name of the test.
     * @param fn The function that contains the test.
     */
    skip: (test: string, fn: () => void) => void;
    /**
     * Runs a test only if the condition is true.
     *
     * @param condition The condition to be checked.
     * @param test The name of the test.
     * @param fn The function that contains the test.
     */
    if: (condition: boolean, test: string, fn: () => void) => void;
  };

  /**
   * Lifecycle hooks that runs before all tests in a scope.
   *
   * Scope is defined by the nearest `describe` block or if no `describe` block is present, the file itself.
   *
   * @param fn The function that contains the setup code.
   * @returns {void}
   */
  export const beforeAll: (fn: () => void) => void;

  /**
   * Lifecycle hooks that runs after all tests in a scope.
   *
   * Scope is defined by the nearest `describe` block or if no `describe` block is present, the file itself.
   *
   * @param fn The function that contains the teardown code.
   * @returns {void}
   */
  export const afterAll: (fn: () => void) => void;

  export type Matchers = {
    /**
     * Asserts that the value is equal to the expected value.
     * @param {any} expected - The expected value.
     * @throws {Error} If the value is not equal to the expected value.
     */
    toBe: (expected: any) => void;

    /**
     * Asserts that the value is null.
     * @throws {Error} If the value is not null.
     */
    toBeNull: () => void;

    /**
     * Asserts that the value is undefined.
     * @throws {Error} If the value is not undefined.
     */
    toBeUndefined: () => void;

    /**
     * Asserts that the value is truthy.
     * @throws {Error} If the value is not truthy.
     */
    toBeTruthy: () => void;

    /**
     * Asserts that the value is falsy.
     * @throws {Error} If the value is not falsy.
     */
    toBeFalsy: () => void;

    /**
     * Asserts that the value is one of the expected values.
     * @param {any[]} expected - The expected values.
     * @throws {Error} If the value is not one of the expected values.
     */
    toBeOneOf: (expected: any[]) => void;

    /**
     * Asserts that the object contains the specified key.
     * @param {string} key - The key to check for.
     * @throws {Error} If the object does not contain the specified key.
     */
    toContainKey: (key: string) => void;

    /**
     * Asserts that the object contains all the specified keys.
     * @param {string[]} keys - The keys to check for.
     * @throws {Error} If the object does not contain all the specified keys.
     */
    toContainKeys: (keys: string[]) => void;

    /**
     * Asserts that the object contains the specified value.
     * @param {any} expected - The value to check for.
     * @throws {Error} If the object does not contain the specified value.
     */
    toContainValue: (expected: any) => void;

    /**
     * Asserts that the object contains all the specified values.
     * @param {any[]} expected - The values to check for.
     * @throws {Error} If the object does not contain all the specified values.
     */
    toContainValues: (expected: any[]) => void;

    /**
     * Asserts that the value has the specified length.
     * @param {number} length - The expected length.
     * @throws {Error} If the value does not have the specified length.
     */
    toHaveLength: (length: number) => void;

    /**
     * Asserts that the value is an instance of the specified class.
     * @param {any} expected - The expected class.
     * @throws {Error} If the value is not an instance of the specified class.
     */
    toBeInstanceOf: (expected: any) => void;

    /**
     * Asserts that the value is a number.
     * @throws {Error} If the value is not a number.
     */
    toBeNumber: () => void;

    /**
     * Asserts that the value is an integer.
     * @throws {Error} If the value is not an integer.
     */
    toBeInteger: () => void;

    /**
     * Asserts that the value is greater than the expected value.
     * @param {number} expected - The expected value.
     * @throws {Error} If the value is not greater than the expected value.
     */
    toBeGreaterThan: (expected: number) => void;

    /**
     * Asserts that the value is less than the expected value.
     * @param {number} expected - The expected value.
     * @throws {Error} If the value is not less than the expected value.
     */
    toBeLessThan: (expected: number) => void;

    /**
     * Asserts that the value is less than or equal to the expected value.
     * @param {number} expected - The expected value.
     * @throws {Error} If the value is not less than or equal to the expected value.
     */
    toBeLessThanOrEqual: (expected: number) => void;

    /**
     * Asserts that the value is greater than or equal to the expected value.
     * @param {number} expected - The expected value.
     * @throws {Error} If the value is not greater than or equal to the expected value.
     */
    toBeGreaterThanOrEqual: (expected: number) => void;

    /**
     * Asserts that the value is NaN.
     * @throws {Error} If the value is not NaN.
     */
    toBeNaN: () => void;

    /**
     * Asserts that the function throws an error.
     * @throws {Error} If the function does not throw an error.
     */
    toThrow: () => void;

    /**
     * Asserts that the value is an array.
     * @throws {Error} If the value is not an array.
     */
    toBeArray: () => void;

    /**
     * Asserts that the value is an object.
     * @throws {Error} If the value is not an object.
     */
    toBeObject: () => void;

    /**
     * Asserts that the value is a string.
     * @throws {Error} If the value is not a string.
     */
    toBeString: () => void;

    /**
     * Asserts that the value is a boolean.
     * @throws {Error} If the value is not a boolean.
     */
    toBeBoolean: () => void;

    /**
     * Asserts that the value is a symbol.
     * @throws {Error} If the value is not a symbol.
     */
    toBeSymbol: () => void;

    /**
     * Asserts that the value is a function.
     * @throws {Error} If the value is not a function.
     */
    toBeFunction: () => void;

    /**
     * Asserts that the value is a Date object.
     * @throws {Error} If the value is not a Date object.
     */
    toBeDate: () => void;

    /**
     * Asserts that the string value starts with the expected string.
     * @param {string} expected - The expected starting string.
     * @throws {Error} If the value does not start with the expected string.
     */
    toStartWith: (expected: string) => void;

    /**
     * Asserts that the string value ends with the expected string.
     * @param {string} expected - The expected ending string.
     * @throws {Error} If the value does not end with the expected string.
     */
    toEndWith: (expected: string) => void;

    /**
     * Asserts that the array or string value includes the expected value.
     * @param {any} expected - The expected value.
     * @throws {Error} If the value does not include the expected value.
     */
    toInclude: (expected: any) => void;

    /**
     * Asserts that the value is not equal to the expected value.
     * @param {any} expected - The value that the actual value should not be equal to.
     * @throws {Error} If the value is equal to the expected value.
     */
    notToBe: (expected: any) => void;

    /**
     * Asserts that the value is not null.
     * @throws {Error} If the value is null.
     */
    notToBeNull: () => void;

    /**
     * Asserts that the value is not undefined.
     * @throws {Error} If the value is undefined.
     */
    notToBeUndefined: () => void;

    /**
     * Asserts that the value is not truthy.
     * @throws {Error} If the value is truthy.
     */
    notToBeTruthy: () => void;

    /**
     * Asserts that the value is not falsy.
     * @throws {Error} If the value is falsy.
     */
    notToBeFalsy: () => void;

    /**
     * Asserts that the value is not one of the expected values.
     * @param {any[]} expected - The values that the actual value should not be one of.
     * @throws {Error} If the value is one of the expected values.
     */
    notToBeOneOf: (expected: any[]) => void;

    /**
     * Asserts that the object does not contain the specified key.
     * @param {string} key - The key that the object should not contain.
     * @throws {Error} If the object contains the specified key.
     */
    notToContainKey: (key: string) => void;

    /**
     * Asserts that the object does not contain any of the specified keys.
     * @param {string[]} keys - The keys that the object should not contain.
     * @throws {Error} If the object contains any of the specified keys.
     */
    notToContainKeys: (keys: string[]) => void;

    /**
     * Asserts that the object does not contain the specified value.
     * @param {any} expected - The value that the object should not contain.
     * @throws {Error} If the object contains the specified value.
     */
    notToContainValue: (expected: any) => void;

    /**
     * Asserts that the object does not contain any of the specified values.
     * @param {any[]} expected - The values that the object should not contain.
     * @throws {Error} If the object contains any of the specified values.
     */
    notToContainValues: (expected: any[]) => void;

    /**
     * Asserts that the value does not have the specified length.
     * @param {number} length - The length that the actual value should not have.
     * @throws {Error} If the value has the specified length.
     */
    notToHaveLength: (length: number) => void;

    /**
     * Asserts that the value is not an instance of the specified class.
     * @param {any} expected - The class that the actual value should not be an instance of.
     * @throws {Error} If the value is an instance of the specified class.
     */
    notToBeInstanceOf: (expected: any) => void;

    /**
     * Asserts that the value is not a number.
     * @throws {Error} If the value is a number.
     */
    notToBeNumber: () => void;

    /**
     * Asserts that the value is not an integer.
     * @throws {Error} If the value is an integer.
     */
    notToBeInteger: () => void;

    /**
     * Asserts that the value is not greater than the expected value.
     * @param {number} expected - The value that the actual value should not be greater than.
     * @throws {Error} If the value is greater than the expected value.
     */
    notToBeGreaterThan: (expected: number) => void;

    /**
     * Asserts that the value is not less than the expected value.
     * @param {number} expected - The value that the actual value should not be less than.
     * @throws {Error} If the value is less than the expected value.
     */
    notToBeLessThan: (expected: number) => void;

    /**
     * Asserts that the value is not less than or equal to the expected value.
     * @param {number} expected - The value that the actual value should not be less than or equal to.
     * @throws {Error} If the value is less than or equal to the expected value.
     */
    notToBeLessThanOrEqual: (expected: number) => void;

    /**
     * Asserts that the value is not greater than or equal to the expected value.
     * @param {number} expected - The value that the actual value should not be greater than or equal to.
     * @throws {Error} If the value is greater than or equal to the expected value.
     */
    notToBeGreaterThanOrEqual: (expected: number) => void;

    /**
     * Asserts that the value is not NaN.
     * @throws {Error} If the value is NaN.
     */
    notToBeNaN: () => void;

    /**
     * Asserts that the function does not throw an error.
     * @throws {Error} If the function throws an error.
     */
    notToThrow: () => void;

    /**
     * Asserts that the value is not an array.
     * @throws {Error} If the value is an array.
     */
    notToBeArray: () => void;

    /**
     * Asserts that the value is not an object.
     * @throws {Error} If the value is an object.
     */
    notToBeObject: () => void;

    /**
     * Asserts that the value is not a string.
     * @throws {Error} If the value is a string.
     */
    notToBeString: () => void;

    /**
     * Asserts that the value is not a boolean.
     * @throws {Error} If the value is a boolean.
     */
    notToBeBoolean: () => void;

    /**
     * Asserts that the value is not a symbol.
     * @throws {Error} If the value is a symbol.
     */
    notToBeSymbol: () => void;

    /**
     * Asserts that the value is not a function.
     * @throws {Error} If the value is a function.
     */
    notToBeFunction: () => void;

    /**
     * Asserts that the value is not a Date object.
     * @throws {Error} If the value is a Date object.
     */
    notToBeDate: () => void;

    /**
     * Asserts that the string value does not start with the expected string.
     * @param {string} expected - The string that the actual value should not start with.
     * @throws {Error} If the value starts with the expected string.
     */
    notToStartWith: (expected: string) => void;

    /**
     * Asserts that the string value does not end with the expected string.
     * @param {string} expected - The string that the actual value should not end with.
     * @throws {Error} If the value ends with the expected string.
     */
    notToEndWith: (expected: string) => void;

    /**
     * Asserts that the array or string value does not include the expected value.
     * @param {any} expected - The value that the actual value should not include.
     * @throws {Error} If the value includes the expected value.
     */
    notToInclude: (expected: any) => void;
  };

  const expect: (value: any) => Matchers;

  global {
    /**
     * Describes a group of tests stored in a global object.
     * @internal
     */
    type InternalDescribeGroup = {
      name: string;
      tests: IkeInternalTest[];
      path: string;
    };

    /**
     * Test status.
     */
    enum TestStatus {
      Pass,
      Fail,
      Todo,
      Skip,
    }

    /**
     * Describes a test stored in a global object.
     * @internal
     */
    type IkeInternalTest = {
      name: string;
      fn: () => void;
    };

    /**
     * Internal object used to store test results.
     * @internal
     */
    const IKE_INTERNAL_TEST: {
      groups: InternalDescribeGroup[];
      alone: IkeInternalTest[];
    };
  }

  export { describe, it, expect };
}
