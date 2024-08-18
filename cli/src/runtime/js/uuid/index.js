// @bun
// ike/src/runtime/ts/uuid/validate.ts
var UUID_REGEX = /^(?:[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$/i;
var validate = (uuid) => typeof uuid === "string" && UUID_REGEX.test(uuid);

// ike/src/runtime/ts/uuid/parse.ts
var $uuidParse = $rustFunction("uuidParse");
var parse = (uuid) => {
  if (!validate(uuid)) {
    throw new TypeError("Invalid UUID provided to parse");
  }
  return $uuidParse(uuid);
};
// ike/src/runtime/ts/uuid/stringify.ts
import {InvalidArgTypeError} from "@std/_internal_";
import {assert as assert2} from "@std/assert";
var $uuidStringify = $rustFunction("uuidStringify");
var stringify = (uuid, offset = 0) => {
  if (!(uuid instanceof Uint8Array)) {
    throw new InvalidArgTypeError("uuid", "Uint8Array", uuid);
  }
  assert2(offset >= 0, "Offset must be a non-negative integer");
  return $uuidStringify(uuid, offset);
};

// ike/src/runtime/ts/uuid/index.ts
var uuidv4 = $rustFunction("uuidv4");
var uuidv5 = (namespace, name) => {
  if (typeof namespace !== "string") {
    throw new TypeError("Namespace must be a string");
  }
  if (typeof name !== "string") {
    throw new TypeError("Name must be a string");
  }
  console.log(namespace, name);
  return $rustFunction("uuidv5")(namespace, name);
};
export {
  validate,
  uuidv5,
  uuidv4,
  stringify,
  parse,
  UUID_REGEX
};
