// @bun
// ike/src/runtime/ts/buffer/index.ts
import {
InvalidArgTypeError,
isArrayBuffer,
isTypedArray
} from "@std/_internal_";
var $isAscii = $rustFunction("isAscii");
var atob = $rustFunction("atob");
var btoa = $rustFunction("btoa");
var $isUtf8 = $rustFunction("isUtf8");
var isAscii = (data) => {
  if (isArrayBuffer(data) || isTypedArray(data)) {
    return $isAscii(data);
  }
  throw new InvalidArgTypeError("data", ["TypedArray", "ArrayBuffer", "SharedArrayBuffer"], data);
};
var isUtf8 = (data) => {
  if (isArrayBuffer(data) || isTypedArray(data)) {
    return $isUtf8(data);
  }
  throw new InvalidArgTypeError("data", ["TypedArray", "ArrayBuffer", "SharedArrayBuffer"], data);
};
export {
  isUtf8,
  isAscii,
  btoa,
  atob
};
