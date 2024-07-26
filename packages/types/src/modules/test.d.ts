declare module 'test' {
  /**
   * Describes a group of tests.
   *
   * @param group The name of the group.
   * @param fn The function that contains the tests.
   */
  function describe(group: string, fn: () => void): void;

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
     * Describes a test.
     *
     * @param test The name of the test.
     * @param fn The function that contains the test.
     */
    function it(test: string, fn: () => void): void;

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

  export { describe, it };
}
