import { AssertionError } from '@std/assert';
export const noop = () => {};

declare global {
  interface ArrayBuffer {
    readonly detached: boolean;

    transfer(): ArrayBuffer;
  }

  function structuredClone<T>(
    value: T,
    options: { transfer: ArrayBuffer[] },
  ): T;
}

export const rethrowAssertionErrorRejection: (e: any) => void = (e: any) => {
  if (e instanceof AssertionError) {
    setTimeout(() => {
      throw e;
    }, 0);
  }
};

export type NonShared<T extends ArrayBufferView> = T & {
  buffer: ArrayBuffer;
};

export interface TypedArrayConstructor<T extends TypedArray = TypedArray>
  extends ArrayBufferViewConstructor<T> {
  readonly BYTES_PER_ELEMENT: number;
}

export interface ArrayBufferViewConstructor<
  T extends ArrayBufferView = ArrayBufferView,
> {
  new (buffer: ArrayBuffer, byteOffset: number, length?: number): T;

  readonly prototype: T;
}

export let isDetachedBuffer = (O: ArrayBuffer): boolean => {
  if (typeof O.detached === 'boolean') {
    isDetachedBuffer = (buffer) => buffer.detached;
  } else {
    isDetachedBuffer = (buffer) => buffer.byteLength === 0;
  }
  return isDetachedBuffer(O);
};

export let transferArrayBuffer = (O: ArrayBuffer): ArrayBuffer => {
  if (typeof O.transfer === 'function') {
    transferArrayBuffer = (buffer) => buffer.transfer();
  } else if (typeof structuredClone === 'function') {
    transferArrayBuffer = (buffer) =>
      structuredClone(buffer, { transfer: [buffer] });
  } else {
    transferArrayBuffer = (buffer) => buffer;
  }
  return transferArrayBuffer(O);
};

export const copyDataBlockBytes = (
  dest: ArrayBuffer,
  destOffset: number,
  src: ArrayBuffer,
  srcOffset: number,
  n: number,
) => {
  new Uint8Array(dest).set(new Uint8Array(src, srcOffset, n), destOffset);
};

export const arrayBufferSlice = (
  buffer: ArrayBuffer,
  begin: number,
  end: number,
): ArrayBuffer => {
  if (buffer.slice) {
    return buffer.slice(begin, end);
  }
  const length = end - begin;
  const slice = new ArrayBuffer(length);
  copyDataBlockBytes(slice, 0, buffer, begin, length);
  return slice;
};

export const isNonNegativeNumber = (value: any): boolean => {
  return typeof value === 'number' && value >= 0 && !isNaN(value);
};
