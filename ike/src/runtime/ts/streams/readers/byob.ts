import { getArgument, InvalidArgTypeError, isObject } from '@std/_internal_';
import { Queue } from '../queue';
import {
  isReadableStream,
  isReadableStreamLocked,
  type ReadableByteStream,
  type ReadableStream,
} from '../readable-stream';
import type { NonShared } from '../utils';
import { isReadableByteStreamController } from '../byte-stream-controller';
import { readableStreamReaderSetup } from './main';
import { assert } from '@std/assert';

export interface ReadIntoRequest<T extends NonShared<ArrayBufferView>> {
  _chunkSteps(chunk: T): void;
  _closeSteps(chunk: T | undefined): void;
  _errorSteps(e: any): void;
}

export class ReadableStreamBYOBReader {
  _ownerReadableStream!: ReadableByteStream;
  _closedPromise!: Promise<undefined>;
  _closedPromise_resolve?: (value?: undefined) => void;
  _closedPromise_reject?: (reason: any) => void;
  _readIntoRequests: Queue<ReadIntoRequest<any>>;

  constructor(stream: ReadableStream<Uint8Array>) {
    const _stream = getArgument(stream, 'stream', 'ReadableStreamBYOBReader');

    if (!isReadableStream(_stream)) {
      throw new InvalidArgTypeError('stream', 'ReadableStream', _stream);
    }

    if (isReadableStreamLocked(_stream)) {
      throw new TypeError('ReadableStream is already locked by another reader');
    }

    if (!isReadableByteStreamController(stream._readableStreamController)) {
      throw new TypeError(
        'Cannot construct a ReadableStreamBYOBReader for a stream not constructed with a byte source',
      );
    }

    readableStreamReaderSetup(this, _stream);

    this._readIntoRequests = new Queue();
  }
}

export const isReadableStreamBYOBReader = (
  x: any,
): x is ReadableStreamBYOBReader => {
  if (!isObject(x)) {
    return false;
  }

  if (!Object.prototype.hasOwnProperty.call(x, '_readIntoRequests')) {
    return false;
  }

  return x instanceof ReadableStreamBYOBReader;
};

export const readableStreamHasBYOBReader = (
  stream: ReadableByteStream,
): boolean => {
  const reader = stream._reader;

  if (reader === undefined) {
    return false;
  }

  if (!isReadableStreamBYOBReader(reader)) {
    return false;
  }

  return true;
};

export const readableStreamGetNumReadIntoRequests = (
  stream: ReadableByteStream,
): number => {
  return (stream._reader as ReadableStreamBYOBReader)._readIntoRequests.length;
};

export const fulfillReadIntoRequest = (
  stream: ReadableByteStream,
  chunk: ArrayBufferView,
  done: boolean,
) => {
  const reader = stream._reader as ReadableStreamBYOBReader;

  assert(
    reader._readIntoRequests.length > 0,
    'fulfillReadIntoRequest should have requests',
  );

  const readIntoRequest = reader._readIntoRequests.shift()!;
  if (done) {
    readIntoRequest._closeSteps(chunk);
  } else {
    readIntoRequest._chunkSteps(chunk);
  }
};

export const readableStreamBYOBReaderError = (
  reader: ReadableStreamBYOBReader,
  e: any,
) => {
  const readIntoRequests = reader._readIntoRequests;
  reader._readIntoRequests = new Queue();
  readIntoRequests.forEach((readIntoRequest) => {
    readIntoRequest._errorSteps(e);
  });
};
