// Based on Deno implementation:

import { getArgument, toString } from "@std/_internal_";
import { assertProto } from "@std/assert";
import {
  addWebIterators,
  checkForInvalidValueChars,
  checkHeaderNameForHttpTokenCodePoint,
  normalizeHeaderValue,
} from "module:web/main.js";

const _guard = Symbol("guard");
const _headers = Symbol("headers");
const _iterableHeaders = Symbol("iterableHeaders");
const _iterableHeadersCache = Symbol("iterableHeadersCache");

const appendHeader = (headers, name, value) => {
  value = normalizeHeaderValue(value);

  if (!checkHeaderNameForHttpTokenCodePoint(name)) {
    throw new TypeError("Header name is not valid.");
  }
  if (!checkForInvalidValueChars(value)) {
    throw new TypeError("Header value is not valid.");
  }

  if (headers[_guard] == "immutable") {
    throw new TypeError("Headers are immutable.");
  }

  const list = headers[_headers];
  const lowercaseName = name.toLowerCase();
  for (let i = 0; i < list.length; i++) {
    if (list[i][0].toLowerCase() === lowercaseName) {
      name = list[i][0];
      break;
    }
  }
  list.push([name, value]);
};

const getHeader = (headers, name) => {
  const lowercaseName = name.toLowerCase();

  const entries = headers
    .filter((header) => header[0].toLowerCase() === lowercaseName)
    .map((header) => header[1]);

  return entries.length === 0 ? null : entries.join(", ");
};

class Headers {
  [_headers] = [];
  [_guard];

  constructor(input = undefined) {
    if (input !== undefined) {
      if (Array.isArray(input)) {
        for (let i = 0; i < input.length; ++i) {
          const header = input[i];
          if (header.length !== 2) {
            throw new TypeError(
              `Invalid header. Length must be 2, but is ${header.length}`,
            );
          }
          const name = header[0];
          const value = header[1];

          if (Array.isArray(value)) {
            for (let j = 0; j < value.length; ++j) {
              appendHeader(this, name, value[j]);
            }
          } else {
            appendHeader(this, name, value);
          }
        }
      } else if (typeof input === "object" && input !== null) {
        for (const key in input) {
          if (!Object.hasOwn(input, key)) {
            continue;
          }

          if (Array.isArray(input[key])) {
            for (const value of input[key]) {
              appendHeader(this, key, value);
            }
          } else {
            appendHeader(this, key, input[key]);
          }
        }
      } else {
        throw new TypeError("Headers: Invalid input type provided for init");
      }
    }

    this._guard = "none";
  }

  get [_iterableHeaders]() {
    const list = this[_headers];

    if (
      this[_guard] === "immutable" &&
      this[_iterableHeadersCache] !== undefined
    ) {
      return this[_iterableHeadersCache];
    }

    const seenHeaders = { __proto__: null };
    const entries = [];
    for (let i = 0; i < list.length; ++i) {
      const entry = list[i];
      const name = entry[0].toLowerCase();
      const value = entry[1];
      if (value === null) throw new TypeError("Unreachable");
      if (name === "set-cookie") {
        entries.push([name, value]);
      } else {
        const seenHeaderIndex = seenHeaders[name];
        if (seenHeaderIndex !== undefined) {
          const entryValue = entries[seenHeaderIndex][1];
          entries[seenHeaderIndex][1] = entryValue.length > 0
            ? entryValue + "\x2C\x20" + value
            : value;
        } else {
          seenHeaders[name] = entries.length;
          entries.push([name, value]);
        }
      }
    }

    entries.sort((a, b) => {
      const akey = a[0];
      const bkey = b[0];
      if (akey > bkey) return 1;
      if (akey < bkey) return -1;
      return 0;
    });

    this[_iterableHeadersCache] = entries;

    return entries;
  }

  append(name, value) {
    assertProto(this, Headers);

    let name = getArgument(name, "Headers.append", "name");
    let value = getArgument(name, "Headers.append", "value");

    name = toString(name);
    value = toString(value);

    appendHeader(this, name, value);
  }

  delete(name) {
    assertProto(this, Headers);

    // let name = getArgument(name, "Headers.delete", "name");

    name = toString(name);

    if (!checkHeaderNameForHttpTokenCodePoint(name)) {
      throw new TypeError("Header name is not valid.");
    }

    if (this[_guard] == "immutable") {
      throw new TypeError("Headers are immutable.");
    }

    const list = this[_headers];
    const lowercaseName = name.toLowerCase();
    for (let i = 0; i < list.length; i++) {
      if (list[i][0].toLowerCase() === lowercaseName) {
        list.splice(i, 1);
        i--;
      }
    }
  }

  get(name) {
    assertProto(this, Headers);
    // let name = getArgument(name, "Headers.get", "name");

    name = toString(name);

    if (!checkHeaderNameForHttpTokenCodePoint(name)) {
      throw new TypeError("Header name is not valid.");
    }

    return getHeader(this[_headers], name);
  }

  getSetCookie() {
    assertProto(this, Headers);
    const list = this[_headers];

    const cookies = list
      .filter((header) => header[0].toLowerCase() === "set-cookie")
      .map((header) => header[1]);

    return cookies;
  }

  has(name) {
    assertProto(this, Headers);
    // let name = getArgument(name, "Headers.has", "name");

    name = toString(name);

    if (!checkHeaderNameForHttpTokenCodePoint(name)) {
      throw new TypeError("Header name is not valid.");
    }

    return this[_headers].some(
      (header) => header[0].toLowerCase() === name.toLowerCase(),
    );
  }

  set(name, value) {
    assertProto(this, Headers);
    // let name = getArgument(name, "Headers.set", "name");
    // let value = getArgument(name, "Headers.set", "value");

    name = toString(name);
    value = toString(value);

    if (!checkHeaderNameForHttpTokenCodePoint(name)) {
      throw new TypeError("Header name is not valid.");
    }
    if (!checkForInvalidValueChars(value)) {
      throw new TypeError("Header value is not valid.");
    }

    if (this[_guard] == "immutable") {
      throw new TypeError("Headers are immutable.");
    }

    const list = this[_headers];
    const lowercaseName = name.toLowerCase();
    let added = false;

    for (let i = 0; i < list.length; i++) {
      if (list[i][0].toLowerCase() === lowercaseName) {
        if (!added) {
          list[i][1] = value;
          added = true;
        } else {
          list.splice(i, 1);
          i--;
        }
      }
    }

    if (!added) {
      list.push([name, value]);
    }
  }
}

addWebIterators("Headers", Headers, _iterableHeaders);

export { Headers };
