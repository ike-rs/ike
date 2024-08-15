globalThis.DEBUG = false;

import {
  ByteLengthQueuingStrategy,
  CountQueuingStrategy,
  ReadableByteStreamController,
  ReadableStream,
  ReadableStreamBYOBReader,
  ReadableStreamBYOBRequest,
  ReadableStreamDefaultController,
  ReadableStreamDefaultReader,
  TransformStream,
  TransformStreamDefaultController,
  WritableStream,
  WritableStreamDefaultController,
  WritableStreamDefaultWriter,
} from "@std/streams";

function getGlobals() {
  if (typeof globalThis !== "undefined") {
    return globalThis;
  } else if (typeof self !== "undefined") {
    return self;
  } else if (typeof global !== "undefined") {
    return global;
  }
  return undefined;
}

const globals = getGlobals();

const exports = {
  ReadableStream,
  ReadableStreamDefaultController,
  ReadableByteStreamController,
  ReadableStreamBYOBRequest,
  ReadableStreamDefaultReader,
  ReadableStreamBYOBReader,

  WritableStream,
  WritableStreamDefaultController,
  WritableStreamDefaultWriter,

  ByteLengthQueuingStrategy,
  CountQueuingStrategy,

  TransformStream,
  TransformStreamDefaultController,
};

for (const prop in exports) {
  if (Object.prototype.hasOwnProperty.call(exports, prop)) {
    Object.defineProperty(globals, prop, {
      value: exports[prop],
      writable: true,
      configurable: true,
    });
  }
}

globalThis.Ike.path = await import("@std/path");
