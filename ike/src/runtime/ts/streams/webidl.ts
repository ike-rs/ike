import { assert } from '@std/assert';
import type { QueuingStrategy, QueuingStrategySizeCallback } from './queue';
import type {
  ReadableStreamController,
  UnderlyingByteSource,
  UnderlyingDefaultOrByteSource,
  UnderlyingDefaultOrByteSourcePullCallback,
  UnderlyingDefaultOrByteSourceStartCallback,
  UnderlyingSource,
  UnderlyingSourceCancelCallback,
  ValidatedUnderlyingDefaultOrByteSource,
} from './readable-stream';
import { rethrowAssertionErrorRejection } from './utils';

const originalPromise = Promise;
const originalPromiseResolve = Promise.resolve.bind(originalPromise);
const originalPromiseThen = Promise.prototype.then;
const originalPromiseReject = Promise.reject.bind(originalPromise);

export const promiseResolve = originalPromiseResolve;

export function newPromise<T>(
  executor: (
    resolve: (value: T | PromiseLike<T>) => void,
    reject: (reason?: any) => void,
  ) => void,
): Promise<T> {
  return new originalPromise(executor);
}

export function performePromiseThen<T, TResult1 = T, TResult2 = never>(
  promise: Promise<T>,
  onFulfilled?: (value: T) => TResult1 | PromiseLike<TResult1>,
  onRejected?: (reason: any) => TResult2 | PromiseLike<TResult2>,
): Promise<TResult1 | TResult2> {
  return promise.then(onFulfilled, onRejected) as Promise<TResult1 | TResult2>;
}

export const setPromiseIsHandledToTrue = (promise: Promise<unknown>): void => {
  performePromiseThen(promise, undefined, rethrowAssertionErrorRejection);
};

export const promiseResolvedWith = <T>(
  value: T | PromiseLike<T>,
): Promise<T> => {
  return new Promise((resolve) => resolve(value));
};

export const promiseRejectedWith = <T = never>(reason: any): Promise<T> => {
  return Promise.reject(reason);
};

export const transformPromiseWith = <T, TResult1 = T, TResult2 = never>(
  promise: Promise<T>,
  fulfillmentHandler?: (value: T) => TResult1 | PromiseLike<TResult1>,
  rejectionHandler?: (reason: any) => TResult2 | PromiseLike<TResult2>,
): Promise<TResult1 | TResult2> => {
  return performePromiseThen(promise, fulfillmentHandler, rejectionHandler);
};

export const uponPromise = <T>(
  promise: Promise<T>,
  onFulfilled?: (value: T) => null | PromiseLike<null>,
  onRejected?: (reason: any) => null | PromiseLike<null>,
): void => {
  performePromiseThen(
    performePromiseThen(promise, onFulfilled, onRejected),
    undefined,
    rethrowAssertionErrorRejection,
  );
};

function censorNegativeZero(x: number): number {
  return x === 0 ? 0 : x;
}

function integerPart(x: number): number {
  return censorNegativeZero(Math.trunc(x));
}

export const convertULongLongWithEnforceRange = (
  value: unknown,
  context: string,
): number => {
  const lowerBound = 0;
  const upperBound = Number.MAX_SAFE_INTEGER;

  let x = Number(value);
  x = censorNegativeZero(x);

  if (!Number.isFinite(x)) {
    throw new TypeError(`${context} is not a finite number`);
  }

  x = integerPart(x);

  if (x < lowerBound || x > upperBound) {
    throw new TypeError(
      `${context} is outside the accepted range of ${lowerBound} to ${upperBound}, inclusive`,
    );
  }

  if (!Number.isFinite(x) || x === 0) {
    return 0;
  }

  const xBigInt = BigInt(x);
  const resultBigInt = BigInt.asUintN(64, xBigInt);

  return Number(resultBigInt);
};

export const isDictionary = (x: any): x is object | null => {
  return typeof x === 'object' || typeof x === 'function';
};

export const assertDictionary = (
  obj: unknown,
  context: string,
): asserts obj is object | null | undefined => {
  if (obj !== undefined && !isDictionary(obj)) {
    throw new TypeError(`${context} is not an object.`);
  }
};

export const convertUnrestrictedDouble = (value: unknown): number => {
  return Number(value);
};

export const reflectCall = <T, A extends any[], R>(
  F: (this: T, ...fnArgs: A) => R,
  V: T,
  args: A,
): R => {
  if (typeof F !== 'function') {
    throw new TypeError('Argument is not a function');
  }
  return Function.prototype.apply.call(F, V, args);
};

export const promiseCall = <T, A extends any[], R>(
  F: (this: T, ...fnArgs: A) => R | PromiseLike<R>,
  V: T,
  args: A,
): Promise<R> => {
  assert(typeof F === 'function', 'F must be a function');
  assert(V !== undefined, 'V must not be undefined');
  assert(Array.isArray(args), 'args must be an array');
  try {
    return promiseResolvedWith(reflectCall(F, V, args));
  } catch (value) {
    return promiseRejectedWith(value);
  }
};

export const convertQueuingStrategy = <T>(
  init: QueuingStrategy<T> | null | undefined,
  context: string,
): QueuingStrategy<T> => {
  // @ts-ignore
  assertDictionary(init, context);
  const highWaterMark = init?.highWaterMark;
  const size = init?.size;
  return {
    highWaterMark:
      highWaterMark === undefined
        ? undefined
        : convertUnrestrictedDouble(highWaterMark),
    size:
      size === undefined
        ? undefined
        : convertQueuingStrategySize(size, `${context} has member 'size' that`),
  };
};

const convertQueuingStrategySize = <T>(
  fn: QueuingStrategySizeCallback<T>,
  context: string,
): QueuingStrategySizeCallback<T> => {
  if (typeof fn !== 'function') {
    throw new TypeError(`${context} is not a function`);
  }

  return (chunk) => convertUnrestrictedDouble(fn(chunk));
};

export const convertUnderlyingDefaultOrByteSource = <R>(
  source: UnderlyingSource<R> | UnderlyingByteSource | null,
  context: string,
): ValidatedUnderlyingDefaultOrByteSource<R> => {
  // @ts-ignore
  assertDictionary(source, context);
  const original = source as UnderlyingDefaultOrByteSource<R> | null;
  const autoAllocateChunkSize = original?.autoAllocateChunkSize;
  const cancel = original?.cancel;
  const pull = original?.pull;
  const start = original?.start;
  const type = original?.type;
  return {
    autoAllocateChunkSize:
      autoAllocateChunkSize === undefined
        ? undefined
        : convertULongLongWithEnforceRange(
            autoAllocateChunkSize,
            `${context} has member 'autoAllocateChunkSize' that`,
          ),
    cancel:
      cancel === undefined
        ? undefined
        : convertUnderlyingSourceCancelCallback(
            cancel,
            original!,
            `${context} has member 'cancel' that`,
          ),
    pull:
      pull === undefined
        ? undefined
        : convertUnderlyingSourcePullCallback(
            pull,
            original!,
            `${context} has member 'pull' that`,
          ),
    start:
      start === undefined
        ? undefined
        : convertUnderlyingSourceStartCallback(
            start,
            original!,
            `${context} has member 'start' that`,
          ),
    type:
      type === undefined
        ? undefined
        : convertReadableStreamType(type, `${context} has member 'type' that`),
  };
};

const convertUnderlyingSourceCancelCallback = (
  fn: UnderlyingSourceCancelCallback,
  original: UnderlyingDefaultOrByteSource,
  context: string,
): ((reason: any) => Promise<void>) => {
  if (typeof fn !== 'function') {
    throw new TypeError(`${context} is not a function`);
  }
  return (reason: any) => promiseCall(fn, original, [reason]);
};

const convertUnderlyingSourcePullCallback = <R>(
  fn: UnderlyingDefaultOrByteSourcePullCallback<R>,
  original: UnderlyingDefaultOrByteSource<R>,
  context: string,
): ((controller: ReadableStreamController<R>) => Promise<void>) => {
  if (typeof fn !== 'function') {
    throw new TypeError(`${context} is not a function`);
  }
  return (controller: ReadableStreamController<R>) =>
    promiseCall(fn, original, [controller]);
};

const convertUnderlyingSourceStartCallback = <R>(
  fn: UnderlyingDefaultOrByteSourceStartCallback<R>,
  original: UnderlyingDefaultOrByteSource<R>,
  context: string,
): UnderlyingDefaultOrByteSourceStartCallback<R> => {
  if (typeof fn !== 'function') {
    throw new TypeError(`${context} is not a function`);
  }
  return (controller: ReadableStreamController<R>) =>
    reflectCall(fn, original, [controller]);
};

const convertReadableStreamType = (type: string, context: string): 'bytes' => {
  type = `${type}`;
  if (type !== 'bytes') {
    throw new TypeError(
      `${context} '${type}' is not a valid enumeration value for ReadableStreamType`,
    );
  }
  return type;
};
