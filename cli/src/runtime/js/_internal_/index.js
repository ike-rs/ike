// @bun
// ike/src/runtime/ts/_internal_/index.ts
function formatList(arr, conjunction) {
  if (arr.length <= 2)
    return arr.join(` ${conjunction} `);
  return `${arr.slice(0, -1).join(", ")}, ${conjunction} ${arr[arr.length - 1]}`;
}
function determineSpecificType(value) {
  if (value === null)
    return "null";
  if (Array.isArray(value))
    return "array";
  if (value instanceof RegExp)
    return "RegExp";
  return typeof value;
}
function invalidArgTypeMessage(name, expected, actual) {
  if (typeof name !== "string") {
    throw new TypeError("'name' must be a string");
  }
  if (!Array.isArray(expected)) {
    expected = [expected];
  }
  let msg = "The ";
  if (name.endsWith(" argument")) {
    msg += `${name} `;
  } else {
    const type = name.includes(".") ? "property" : "argument";
    msg += `"${name}" ${type} `;
  }
  msg += "must be ";
  const types = [];
  const instances = [];
  const other = [];
  for (const value of expected) {
    if (typeof value !== "string") {
      throw new TypeError("All expected entries have to be of type string");
    }
    if (kTypes.includes(value.toLowerCase())) {
      types.push(value.toLowerCase());
    } else if (classRegExp.test(value)) {
      instances.push(value);
    } else {
      if (value === "object") {
        throw new TypeError('The value "object" should be written as "Object"');
      }
      other.push(value);
    }
  }
  if (instances.length > 0) {
    const pos = types.indexOf("object");
    if (pos !== -1) {
      types.splice(pos, 1);
      instances.push("Object");
    }
  }
  if (types.length > 0) {
    msg += `${types.length > 1 ? "one of type" : "of type"} ${formatList(types, "or")}`;
    if (instances.length > 0 || other.length > 0)
      msg += " or ";
  }
  if (instances.length > 0) {
    msg += `an instance of ${formatList(instances, "or")}`;
    if (other.length > 0)
      msg += " or ";
  }
  if (other.length > 0) {
    if (other.length > 1) {
      msg += `one of ${formatList(other, "or")}`;
    } else {
      if (other[0].toLowerCase() !== other[0])
        msg += "an ";
      msg += `${other[0]}`;
    }
  }
  msg += `. Received ${determineSpecificType(actual)}`;
  return msg;
}
var isTypedArray = (value) => {
  return value instanceof Int8Array || value instanceof Uint8Array || value instanceof Uint8ClampedArray || value instanceof Int16Array || value instanceof Uint16Array || value instanceof Int32Array || value instanceof Uint32Array || value instanceof Float32Array || value instanceof Float64Array || value instanceof BigInt64Array || value instanceof BigUint64Array;
};
var isArrayBuffer = (value) => {
  return value instanceof ArrayBuffer || value instanceof SharedArrayBuffer;
};
var kTypes = [
  "string",
  "number",
  "bigint",
  "boolean",
  "symbol",
  "undefined",
  "object",
  "function"
];
var classRegExp = /^([A-Z][a-z0-9]*)+$/;

class InvalidArgTypeError extends TypeError {
  constructor(name, expected, actual) {
    super(invalidArgTypeMessage(name, expected, actual));
    this.name = "InvalidArgTypeError";
  }
}

class RequiredArgumentError extends TypeError {
  constructor(name, prefix = "") {
    super(`${prefix ? `${prefix}: ` : ""}${name} is required`);
    this.name = "RequiredArgumentError";
  }
}
var getArgument = (arg, name, prefix) => {
  if (arg === undefined) {
    throw new RequiredArgumentError(name, prefix);
  }
  return arg;
};
var isObject = (x) => {
  return typeof x === "object" && x !== null || typeof x === "function";
};
export {
  isTypedArray,
  isObject,
  isArrayBuffer,
  getArgument,
  RequiredArgumentError,
  InvalidArgTypeError
};
