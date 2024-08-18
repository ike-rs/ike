// @bun
// ike/src/runtime/ts/test/index.ts
import {assertEquals, assertNotEquals} from "@std/assert";
var describe = $rustFunction("describe");
var $it = $rustFunction("it");
var beforeAll = $rustFunction("beforeAll");
var afterAll = $rustFunction("afterAll");
var it = (test, fn) => {
  return $it(test, () => {
    return $try_it(fn);
  });
};
var $try_it = (fn) => {
  try {
    fn();
    return {
      status: "pass"
    };
  } catch (e) {
    return {
      status: "fail",
      error: e
    };
  }
};
it.skip = (test, fn) => {
  return $it(test, () => {
    return {
      status: "skip"
    };
  });
};
it.todo = (test, fn) => {
  return $it(test, () => {
    return {
      status: "todo"
    };
  });
};
it.if = (condition, test, fn) => {
  if (condition) {
    return it(test, fn);
  } else {
    return it.skip(test, fn);
  }
};
var expect = (value) => {
  return {
    toBe: (expected) => {
      assertEquals(value, expected, `Expected ${expected}, but got ${value}`);
    },
    notToBe: (expected) => {
      assertNotEquals(value, expected, `Values are the same for ${value}`);
    },
    toBeNull: () => {
      assertEquals(value, null, `Expected null, but got ${value}`);
    },
    notToBeNull: () => {
      assertNotEquals(value, null, `Expected not to be null, but got ${value}`);
    },
    toBeUndefined: () => {
      assertEquals(value, undefined, `Expected undefined, but got ${value}`);
    },
    toMatch: (expected) => {
      if (!expected.test(value)) {
        throw new Error(`Expected ${value} to match ${expected}`);
      }
    },
    notToMatch: (expected) => {
      if (expected.test(value)) {
        throw new Error(`Expected ${value} not to match ${expected}`);
      }
    },
    notToBeUndefined: () => {
      assertNotEquals(value, undefined, `Expected not to be undefined, but got ${value}`);
    },
    toBeTruthy: () => {
      if (!value) {
        throw new Error(`Expected value to be truthy, but got ${value}`);
      }
    },
    notToBeTruthy: () => {
      if (value) {
        throw new Error(`Expected value not to be truthy, but got ${value}`);
      }
    },
    toBeFalsy: () => {
      if (value) {
        throw new Error(`Expected value to be falsy, but got ${value}`);
      }
    },
    notToBeFalsy: () => {
      if (!value) {
        throw new Error(`Expected value not to be falsy, but got ${value}`);
      }
    },
    toBeDefined: () => {
      if (value === undefined) {
        throw new Error(`Expected value to be defined, but got ${value}`);
      }
    },
    notToBeDefined: () => {
      if (value !== undefined) {
        throw new Error(`Expected value not to be defined, but got ${value}`);
      }
    },
    toBeTrue: () => {
      if (value !== true) {
        throw new Error(`Expected value to be true, but got ${value}`);
      }
    },
    notToBeTrue: () => {
      if (value === true) {
        throw new Error(`Expected value not to be true, but got ${value}`);
      }
    },
    toBeFalse: () => {
      if (value !== false) {
        throw new Error(`Expected value to be false, but got ${value}`);
      }
    },
    notToBeFalse: () => {
      if (value === false) {
        throw new Error(`Expected value not to be false, but got ${value}`);
      }
    },
    toBeOneOf: (expected) => {
      if (!expected.includes(value)) {
        throw new Error(`Expected value to be one of ${expected}, but got ${value}`);
      }
    },
    notToBeOneOf: (expected) => {
      if (expected.includes(value)) {
        throw new Error(`Expected value not to be one of ${expected}, but got ${value}`);
      }
    },
    toContainKey: (key) => {
      if (!(key in value)) {
        throw new Error(`Expected object to contain key ${key}`);
      }
    },
    notToContainKey: (key) => {
      if (key in value) {
        throw new Error(`Expected object not to contain key ${key}`);
      }
    },
    toContainKeys: (keys) => {
      for (const key of keys) {
        if (!(key in value)) {
          throw new Error(`Expected object to contain key ${key}`);
        }
      }
    },
    notToContainKeys: (keys) => {
      for (const key of keys) {
        if (key in value) {
          throw new Error(`Expected object not to contain key ${key}`);
        }
      }
    },
    toContainValue: (expected) => {
      if (!Object.values(value).includes(expected)) {
        throw new Error(`Expected object to contain value ${expected}, but got ${value}`);
      }
    },
    notToContainValue: (expected) => {
      if (Object.values(value).includes(expected)) {
        throw new Error(`Expected object not to contain value ${expected}, but got ${value}`);
      }
    },
    toContainValues: (expected) => {
      for (const val of expected) {
        if (!Object.values(value).includes(val)) {
          throw new Error(`Expected object to contain value ${val}, but got ${value}`);
        }
      }
    },
    notToContainValues: (expected) => {
      for (const val of expected) {
        if (Object.values(value).includes(val)) {
          throw new Error(`Expected object not to contain value ${val}, but got ${value}`);
        }
      }
    },
    toHaveLength: (length) => {
      if (value.length !== length) {
        throw new Error(`Expected length to be ${length}, but got ${value.length}`);
      }
    },
    notToHaveLength: (length) => {
      if (value.length === length) {
        throw new Error(`Expected length not to be ${length}, but got ${value.length}`);
      }
    },
    toBeInstanceOf: (expected) => {
      if (!(value instanceof expected)) {
        throw new Error(`Expected value to be instance of ${expected}, but got ${value}`);
      }
    },
    notToBeInstanceOf: (expected) => {
      if (value instanceof expected) {
        throw new Error(`Expected value not to be instance of ${expected}, but got ${value}`);
      }
    },
    toBeNumber: () => {
      if (typeof value !== "number") {
        throw new Error(`Expected value to be a number, but got ${typeof value}`);
      }
    },
    notToBeNumber: () => {
      if (typeof value === "number") {
        throw new Error(`Expected value not to be a number, but got ${typeof value}`);
      }
    },
    toBeInteger: () => {
      if (!Number.isInteger(value)) {
        throw new Error(`Expected value to be an integer, but got ${value}`);
      }
    },
    notToBeInteger: () => {
      if (Number.isInteger(value)) {
        throw new Error(`Expected value not to be an integer, but got ${value}`);
      }
    },
    toBeGreaterThan: (expected) => {
      if (value <= expected) {
        throw new Error(`Expected value to be greater than ${expected}, but got ${value}`);
      }
    },
    notToBeGreaterThan: (expected) => {
      if (value > expected) {
        throw new Error(`Expected value not to be greater than ${expected}, but got ${value}`);
      }
    },
    toBeLessThan: (expected) => {
      if (value >= expected) {
        throw new Error(`Expected value to be less than ${expected}, but got ${value}`);
      }
    },
    notToBeLessThan: (expected) => {
      if (value < expected) {
        throw new Error(`Expected value not to be less than ${expected}, but got ${value}`);
      }
    },
    toBeLessThanOrEqual: (expected) => {
      if (value > expected) {
        throw new Error(`Expected value to be less than or equal ${expected}, but got ${value}`);
      }
    },
    notToBeLessThanOrEqual: (expected) => {
      if (value <= expected) {
        throw new Error(`Expected value not to be less than or equal ${expected}, but got ${value}`);
      }
    },
    toBeGreaterThanOrEqual: (expected) => {
      if (value < expected) {
        throw new Error(`Expected value to be greater than or equal ${expected}, but got ${value}`);
      }
    },
    notToBeGreaterThanOrEqual: (expected) => {
      if (value >= expected) {
        throw new Error(`Expected value not to be greater than or equal ${expected}, but got ${value}`);
      }
    },
    toBeNaN: () => {
      if (!isNaN(value)) {
        throw new Error(`Expected value to be NaN, but got ${value}`);
      }
    },
    notToBeNaN: () => {
      if (isNaN(value)) {
        throw new Error(`Expected value not to be NaN, but got ${value}`);
      }
    },
    toThrow: () => {
      try {
        value();
        throw new Error("Expected function to throw an error, but it did not");
      } catch (e) {
        if (e.message === "Expected function to throw an error, but it did not") {
          throw e;
        }
      }
    },
    notToThrow: () => {
      try {
        value();
      } catch (e) {
        throw new Error("Expected function not to throw an error, but it did: " + e);
      }
    },
    toBeArray: () => {
      if (!Array.isArray(value)) {
        throw new Error(`Expected value to be an array, but got ${typeof value}`);
      }
    },
    notToBeArray: () => {
      if (Array.isArray(value)) {
        throw new Error(`Expected value not to be an array, but got ${typeof value}`);
      }
    },
    toBeObject: () => {
      if (typeof value !== "object" || value === null || Array.isArray(value)) {
        throw new Error(`Expected value to be an object, but got ${typeof value}`);
      }
    },
    notToBeObject: () => {
      if (typeof value === "object" && value !== null && !Array.isArray(value)) {
        throw new Error(`Expected value not to be an object, but got ${typeof value}`);
      }
    },
    toBeString: () => {
      if (typeof value !== "string") {
        throw new Error(`Expected value to be a string, but got ${typeof value}`);
      }
    },
    notToBeString: () => {
      if (typeof value === "string") {
        throw new Error(`Expected value not to be a string, but got ${typeof value}`);
      }
    },
    toBeBoolean: () => {
      if (typeof value !== "boolean") {
        throw new Error(`Expected value to be a boolean, but got ${typeof value}`);
      }
    },
    notToBeBoolean: () => {
      if (typeof value === "boolean") {
        throw new Error(`Expected value not to be a boolean, but got ${typeof value}`);
      }
    },
    toBeSymbol: () => {
      if (typeof value !== "symbol") {
        throw new Error(`Expected value to be a symbol, but got ${typeof value}`);
      }
    },
    notToBeSymbol: () => {
      if (typeof value === "symbol") {
        throw new Error(`Expected value not to be a symbol, but got ${typeof value}`);
      }
    },
    toBeFunction: () => {
      if (typeof value !== "function") {
        throw new Error(`Expected value to be a function, but got ${typeof value}`);
      }
    },
    notToBeFunction: () => {
      if (typeof value === "function") {
        throw new Error(`Expected value not to be a function, but got ${typeof value}`);
      }
    },
    toBeDate: () => {
      if (!(value instanceof Date)) {
        throw new Error(`Expected value to be a date, but got ${typeof value}`);
      }
    },
    notToBeDate: () => {
      if (value instanceof Date) {
        throw new Error(`Expected value not to be a date, but got ${typeof value}`);
      }
    },
    toStartWith: (expected) => {
      if (!value.startsWith(expected)) {
        throw new Error(`Expected value to start with ${expected}, but got ${value}`);
      }
    },
    notToStartWith: (expected) => {
      if (value.startsWith(expected)) {
        throw new Error(`Expected value not to start with ${expected}, but got ${value}`);
      }
    },
    toEndWith: (expected) => {
      if (!value.endsWith(expected)) {
        throw new Error(`Expected value to end with ${expected}, but got ${value}`);
      }
    },
    notToEndWith: (expected) => {
      if (value.endsWith(expected)) {
        throw new Error(`Expected value not to end with ${expected}, but got ${value}`);
      }
    },
    toInclude: (expected) => {
      if (!value.includes(expected)) {
        throw new Error(`Expected value to include ${expected}, but got ${value}`);
      }
    },
    notToInclude: (expected) => {
      if (value.includes(expected)) {
        throw new Error(`Expected value not to include ${expected}, but got ${value}`);
      }
    }
  };
};
export {
  it,
  expect,
  describe,
  beforeAll,
  afterAll
};
