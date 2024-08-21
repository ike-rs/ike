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
import { clearTimeout, setTimeout } from "module:web/timeouts.js";

const registerGlobal = (name, value) => {
    Object.defineProperty(globalThis, name, {
        value,
        writable: true,
        configurable: true,
    });
};

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

    setTimeout,
    clearTimeout,
};

for (const prop in exports) {
    if (Object.prototype.hasOwnProperty.call(exports, prop)) {
        registerGlobal(prop, exports[prop]);
    }
}

globalThis.Ike.path = await import("@std/path");
