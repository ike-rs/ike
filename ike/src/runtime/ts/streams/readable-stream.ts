import { isObject } from '@std/_internal_';
import { SymbolAsyncIterator } from './ecmascript';
import {
  closedPromiseReject,
  closedPromiseResolve,
  isReadableStreamDefaultReader,
  readableStreamDefaultReaderError,
  type ReadableStreamDefaultReader,
} from './readers/main';
import { Queue, type QueuingStrategy } from './queue';
import {
  convertQueuingStrategy,
  convertUnderlyingDefaultOrByteSource,
  promiseRejectedWith,
  promiseResolvedWith,
  transformPromiseWith,
} from './webidl';
import { noop, type NonShared } from './utils';
import { cancelStepsSymbol } from './symbols';
import {
  isReadableStreamBYOBReader,
  readableStreamBYOBReaderError,
  type ReadableStreamBYOBReader,
} from './readers/byob';
import type { ReadableByteStreamController } from './byte-stream-controller';
import { assert } from '@std/assert';
import type { ReadableStreamDefaultController } from './default-controller';

type ReadableStreamState = 'readable' | 'closed' | 'errored';
export type ReadableStreamReader<R> =
  | ReadableStreamDefaultReader<R>
  | ReadableStreamBYOBReader;

export type ReadableByteStream = ReadableStream<NonShared<Uint8Array>> & {
  _readableStreamController: ReadableByteStreamController;
};

export type ReadableStreamController<R = any> =
  | ReadableStreamDefaultController<R>
  | ReadableByteStreamController;
export type UnderlyingDefaultOrByteSourceStartCallback<R> = (
  controller: ReadableStreamController<R>,
) => void | PromiseLike<void>;
export type UnderlyingDefaultOrByteSourcePullCallback<R> = (
  controller: ReadableStreamController<R>,
) => void | PromiseLike<void>;

export type UnderlyingSourceStartCallback<R> = (
  controller: ReadableStreamDefaultController<R>,
) => void | PromiseLike<void>;
export type UnderlyingSourcePullCallback<R> = (
  controller: ReadableStreamDefaultController<R>,
) => void | PromiseLike<void>;
export type UnderlyingByteSourceStartCallback = (
  controller: ReadableByteStreamController,
) => void | PromiseLike<void>;
export type UnderlyingByteSourcePullCallback = (
  controller: ReadableByteStreamController,
) => void | PromiseLike<void>;
export type UnderlyingSourceCancelCallback = (
  reason: any,
) => void | PromiseLike<void>;

export type ReadableStreamType = 'bytes';

export interface UnderlyingSource<R = any> {
  start?: UnderlyingSourceStartCallback<R>;
  pull?: UnderlyingSourcePullCallback<R>;
  cancel?: UnderlyingSourceCancelCallback;
  type?: undefined;
}

export interface UnderlyingByteSource {
  start?: UnderlyingByteSourceStartCallback;
  pull?: UnderlyingByteSourcePullCallback;
  cancel?: UnderlyingSourceCancelCallback;
  type: 'bytes';
  autoAllocateChunkSize?: number;
}

export interface UnderlyingDefaultOrByteSource<R = any> {
  start?: UnderlyingDefaultOrByteSourceStartCallback<R>;
  pull?: UnderlyingDefaultOrByteSourcePullCallback<R>;
  cancel?: UnderlyingSourceCancelCallback;
  type?: ReadableStreamType;
  autoAllocateChunkSize?: number;
}

export interface ValidatedUnderlyingSource<R = any>
  extends UnderlyingSource<R> {
  pull?: (controller: ReadableStreamDefaultController<R>) => Promise<void>;
  cancel?: (reason: any) => Promise<void>;
}

export interface ValidatedUnderlyingByteSource extends UnderlyingByteSource {
  pull?: (controller: ReadableByteStreamController) => Promise<void>;
  cancel?: (reason: any) => Promise<void>;
}

export type ValidatedUnderlyingDefaultOrByteSource<R = any> =
  | ValidatedUnderlyingSource<R>
  | ValidatedUnderlyingByteSource;

export class ReadableStream<R = any> /**implements AsyncIterable<R>**/ {
  _state!: ReadableStreamState;
  _reader: ReadableStreamReader<R> | undefined;
  _storedError: any;
  _disturbed!: boolean;
  _readableStreamController!:
    | ReadableStreamDefaultController<R>
    | ReadableByteStreamController;

  constructor(
    underlyingSource: UnderlyingByteSource,
    strategy?: { highWaterMark?: number; size?: undefined },
  );
  constructor(
    underlyingSource?: UnderlyingSource<R>,
    strategy?: QueuingStrategy<R>,
  );
  constructor(
    rawUnderlyingSource:
      | UnderlyingSource<R>
      | UnderlyingByteSource
      | null
      | undefined = {},
    rawStrategy: QueuingStrategy<R> | null | undefined = {},
  ) {
    if (rawUnderlyingSource === undefined) {
      rawUnderlyingSource = null;
    } else {
      if (!isObject(rawUnderlyingSource)) {
        throw new TypeError('First parameter must be an object');
      }
    }

    const strategy = convertQueuingStrategy(rawStrategy, 'Second parameter');
    const underlyingSource = convertUnderlyingDefaultOrByteSource(
      rawUnderlyingSource,
      'First parameter',
    );

    // InitializeReadableStream(this);

    // if (underlyingSource.type === 'bytes') {
    //   if (strategy.size !== undefined) {
    //     throw new RangeError(
    //       'The strategy for a byte stream cannot have a size function',
    //     );
    //   }
    //   const highWaterMark = ExtractHighWaterMark(strategy, 0);
    //   SetUpReadableByteStreamControllerFromUnderlyingSource(
    //     this as unknown as ReadableByteStream,
    //     underlyingSource,
    //     highWaterMark,
    //   );
    // } else {
    //   assert(underlyingSource.type === undefined, 'type is not undefined');
    //   const sizeAlgorithm = ExtractSizeAlgorithm(strategy);
    //   const highWaterMark = ExtractHighWaterMark(strategy, 1);
    //   SetUpReadableStreamDefaultControllerFromUnderlyingSource(
    //     this,
    //     underlyingSource,
    //     highWaterMark,
    //     sizeAlgorithm,
    //   );
    // }
  }
}

export const isReadableStream = (x: any): x is ReadableStream => {
  if (!isObject(x)) {
    return false;
  }

  if (!Object.prototype.hasOwnProperty.call(x, '_readableStreamController')) {
    return false;
  }

  return x instanceof ReadableStream;
};

export const isReadableStreamLocked = (reader: ReadableStream): boolean => {
  if (reader._reader === undefined) {
    return false;
  }

  return true;
};

export const cancelReadableStream = <R>(
  stream: ReadableStream<R>,
  reason: any,
): Promise<undefined> => {
  stream._disturbed = true;

  if (stream._state === 'closed') {
    return promiseResolvedWith(undefined);
  }
  if (stream._state === 'errored') {
    return promiseRejectedWith(stream._storedError);
  }

  readableStreamClose(stream);

  const reader = stream._reader;
  if (reader !== undefined && isReadableStreamBYOBReader(reader)) {
    const readIntoRequests = reader._readIntoRequests;
    reader._readIntoRequests = new Queue();
    readIntoRequests.forEach((readIntoRequest) => {
      readIntoRequest._closeSteps(undefined);
    });
  }

  const sourceCancelPromise =
    stream._readableStreamController[cancelStepsSymbol](reason);
  return transformPromiseWith(sourceCancelPromise, noop) as Promise<undefined>;
};

export const readableStreamClose = <R>(stream: ReadableStream<R>): void => {
  assert(stream._state === 'readable', 'stream._state is not readable');

  stream._state = 'closed';

  const reader = stream._reader;

  if (reader === undefined) {
    return;
  }

  closedPromiseResolve(reader);

  if (isReadableStreamDefaultReader<R>(reader)) {
    const readRequests = reader._readRequests;
    reader._readRequests = new Queue();
    readRequests.forEach((readRequest) => {
      readRequest._closeSteps();
    });
  }
};

export const readableStreamError = <R>(
  stream: ReadableStream<R>,
  e: any,
): void => {
  assert(isReadableStream(stream), 'stream is not a ReadableStream');
  assert(stream._state === 'readable', 'stream._state is not readable');

  stream._state = 'errored';
  stream._storedError = e;

  const reader = stream._reader;

  if (reader === undefined) {
    return;
  }

  closedPromiseReject(reader, e);

  if (isReadableStreamDefaultReader<R>(reader)) {
    readableStreamDefaultReaderError(reader, e);
  } else {
    assert(isReadableStreamBYOBReader(reader), 'reader is not a BYOB reader');
    readableStreamBYOBReaderError(reader, e);
  }
};
