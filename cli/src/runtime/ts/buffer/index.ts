import {
  InvalidArgTypeError,
  isArrayBuffer,
  isTypedArray,
} from '@std/_internal_';

const $isAscii = $rustFunction('isAscii');
const $isUtf8 = $rustFunction('isUtf8');

const isAscii = (data: TypedArray | ArrayBuffer): boolean => {
  if (isArrayBuffer(data) || isTypedArray(data)) {
    return $isAscii(data);
  }

  throw new InvalidArgTypeError(
    'data',
    ['TypedArray', 'ArrayBuffer', 'SharedArrayBuffer'],
    data,
  );
};

const isUtf8 = (data: TypedArray | ArrayBuffer): boolean => {
  if (isArrayBuffer(data) || isTypedArray(data)) {
    return $isUtf8(data);
  }

  throw new InvalidArgTypeError(
    'data',
    ['TypedArray', 'ArrayBuffer', 'SharedArrayBuffer'],
    data,
  );
};

export { atob, btoa, isAscii, isUtf8 };
