// @bun
var __create = Object.create;
var __getProtoOf = Object.getPrototypeOf;
var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __toESM = (mod, isNodeMode, target) => {
  target = mod != null ? __create(__getProtoOf(mod)) : {};
  const to = isNodeMode || !mod || !mod.__esModule
    ? __defProp(target, "default", { value: mod, enumerable: true })
    : target;
  for (let key of __getOwnPropNames(mod)) {
    if (!__hasOwnProp.call(to, key)) {
      __defProp(to, key, {
        get: () => mod[key],
        enumerable: true,
      });
    }
  }
  return to;
};
var __commonJS =
  (cb, mod) =>
  () => (mod || cb((mod = { exports: {} }).exports, mod), mod.exports);

// node_modules/safe-buffer/index.js
var require_safe_buffer = __commonJS((exports, module) => {
  function copyProps(src, dst) {
    for (var key in src) {
      dst[key] = src[key];
    }
  }
  function SafeBuffer(arg, encodingOrOffset, length) {
    return Buffer(arg, encodingOrOffset, length);
  }
  /*! safe-buffer. MIT License. Feross Aboukhadijeh <https://feross.org/opensource> */
  var buffer = import.meta.require("buffer");
  var Buffer = buffer.Buffer;
  if (
    Buffer.from && Buffer.alloc && Buffer.allocUnsafe && Buffer.allocUnsafeSlow
  ) {
    module.exports = buffer;
  } else {
    copyProps(buffer, exports);
    exports.Buffer = SafeBuffer;
  }
  SafeBuffer.prototype = Object.create(Buffer.prototype);
  copyProps(Buffer, SafeBuffer);
  SafeBuffer.from = function (arg, encodingOrOffset, length) {
    if (typeof arg === "number") {
      throw new TypeError("Argument must not be a number");
    }
    return Buffer(arg, encodingOrOffset, length);
  };
  SafeBuffer.alloc = function (size, fill, encoding) {
    if (typeof size !== "number") {
      throw new TypeError("Argument must be a number");
    }
    var buf = Buffer(size);
    if (fill !== undefined) {
      if (typeof encoding === "string") {
        buf.fill(fill, encoding);
      } else {
        buf.fill(fill);
      }
    } else {
      buf.fill(0);
    }
    return buf;
  };
  SafeBuffer.allocUnsafe = function (size) {
    if (typeof size !== "number") {
      throw new TypeError("Argument must be a number");
    }
    return Buffer(size);
  };
  SafeBuffer.allocUnsafeSlow = function (size) {
    if (typeof size !== "number") {
      throw new TypeError("Argument must be a number");
    }
    return buffer.SlowBuffer(size);
  };
});

// node_modules/randombytes/index.js
var require_randombytes = __commonJS((exports, module) => {
  module.exports = import.meta.require("crypto").randomBytes;
});

// node_modules/randomfill/browser.js
var require_browser = __commonJS((exports) => {
  function assertOffset(offset, length) {
    if (typeof offset !== "number" || offset !== offset) {
      throw new TypeError("offset must be a number");
    }
    if (offset > kMaxUint32 || offset < 0) {
      throw new TypeError("offset must be a uint32");
    }
    if (offset > kBufferMaxLength || offset > length) {
      throw new RangeError("offset out of range");
    }
  }
  function assertSize(size, offset, length) {
    if (typeof size !== "number" || size !== size) {
      throw new TypeError("size must be a number");
    }
    if (size > kMaxUint32 || size < 0) {
      throw new TypeError("size must be a uint32");
    }
    if (size + offset > length || size > kBufferMaxLength) {
      throw new RangeError("buffer too small");
    }
  }
  function randomFill(buf, offset, size, cb) {
    if (!Buffer.isBuffer(buf) && !(buf instanceof global.Uint8Array)) {
      throw new TypeError('"buf" argument must be a Buffer or Uint8Array');
    }
    if (typeof offset === "function") {
      cb = offset;
      offset = 0;
      size = buf.length;
    } else if (typeof size === "function") {
      cb = size;
      size = buf.length - offset;
    } else if (typeof cb !== "function") {
      throw new TypeError('"cb" argument must be a function');
    }
    assertOffset(offset, buf.length);
    assertSize(size, offset, buf.length);
    return actualFill(buf, offset, size, cb);
  }
  function actualFill(buf, offset, size, cb) {
    if (false) {
      var ourBuf;
      var uint;
    }
    if (cb) {
      randombytes(size, function (err, bytes2) {
        if (err) {
          return cb(err);
        }
        bytes2.copy(buf, offset);
        cb(null, buf);
      });
      return;
    }
    var bytes = randombytes(size);
    bytes.copy(buf, offset);
    return buf;
  }
  function randomFillSync(buf, offset, size) {
    if (typeof offset === "undefined") {
      offset = 0;
    }
    if (!Buffer.isBuffer(buf) && !(buf instanceof global.Uint8Array)) {
      throw new TypeError('"buf" argument must be a Buffer or Uint8Array');
    }
    assertOffset(offset, buf.length);
    if (size === undefined) {
      size = buf.length - offset;
    }
    assertSize(size, offset, buf.length);
    return actualFill(buf, offset, size);
  }
  var safeBuffer = require_safe_buffer();
  var randombytes = require_randombytes();
  var Buffer = safeBuffer.Buffer;
  var kBufferMaxLength = safeBuffer.kMaxLength;
  var crypto = global.crypto || global.msCrypto;
  var kMaxUint32 = Math.pow(2, 32) - 1;
  if (crypto && crypto.getRandomValues || true) {
    exports.randomFill = randomFill;
    exports.randomFillSync = randomFillSync;
  } else {
  }
});

// node_modules/randomfill/index.js
var require_randomfill = __commonJS((exports, module) => {
  var crypto = import.meta.require("crypto");
  if (
    typeof crypto.randomFill === "function" &&
    typeof crypto.randomFillSync === "function"
  ) {
    exports.randomFill = crypto.randomFill;
    exports.randomFillSync = crypto.randomFillSync;
  } else {
    module.exports = require_browser();
  }
});

// ike/src/runtime/ts/crypto/index.ts
var import_randomfill = __toESM(require_randomfill(), 1);
var export_randomFillSync = import_randomfill.randomFillSync;
var export_randomFill = import_randomfill.randomFill;

export {
  export_randomFill as randomFill,
  export_randomFillSync as randomFillSync,
};
