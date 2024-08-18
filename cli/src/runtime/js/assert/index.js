// @bun
// ike/src/runtime/ts/assert/index.ts
import {inspect as inspect2} from "@std/inspect";

class AssertionError extends Error {
  constructor(message) {
    super(message);
    this.name = "AssertionError";
  }
}
var assertEquals = (actual, expected, msg) => {
  const actualStr = inspect2(actual);
  const expectedStr = inspect2(expected);
  if (actualStr == expectedStr) {
    return;
  }
  throw new AssertionError(`Expected ${expectedStr}, but got ${actualStr}. ${msg}`);
};
var assert = (condition, msg) => {
  if (condition) {
    return;
  }
  throw new AssertionError(msg);
};
var assertNotEquals = (actual, expected, msg) => {
  const actualStr = inspect2(actual);
  const expectedStr = inspect2(expected);
  if (actualStr != expectedStr) {
    return;
  }
  throw new AssertionError(`Values are the same for ${actualStr}. ${msg}`);
};
export {
  assertNotEquals,
  assertEquals,
  assert,
  AssertionError
};
