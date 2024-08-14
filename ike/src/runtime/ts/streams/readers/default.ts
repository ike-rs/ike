import { getArgument, InvalidArgTypeError, isObject } from '@std/_internal_';
import { Queue } from '../queue';
import {
  isReadableStream,
  isReadableStreamLocked,
  type ReadableStream,
} from '../readable-stream';
import {
  readableStreamReaderClose,
  readableStreamReaderSetup,
  releaseReadableStreamReaderBase,
} from './main';
import { newPromise, promiseRejectedWith } from '../webidl';
import { assert } from '@std/assert';
import { pullStepsSymbol } from '../symbols';

export interface ReadRequest<R> {
  _chunkSteps(chunk: R): void;
  _closeSteps(): void;
  _errorSteps(e: any): void;
}

export const isReadableStreamDefaultReader = <R>(
  x: any,
): x is ReadableStreamDefaultReader<R> => {
  if (!isObject(x)) {
    return false;
  }

  if (!Object.prototype.hasOwnProperty.call(x, '_readRequests')) {
    return false;
  }

  return x instanceof ReadableStreamDefaultReader;
};

export type ReadableStreamDefaultReadResult<T> =
  | {
      done: false;
      value: T;
    }
  | {
      done: true;
      value?: undefined;
    };

export class ReadableStreamDefaultReader<R = any> {
  _ownerReadableStream!: ReadableStream<R>;
  _closedPromise!: Promise<undefined>;
  _closedPromise_resolve?: (value?: undefined) => void;
  _closedPromise_reject?: (reason: any) => void;
  _readRequests: Queue<ReadRequest<R>>;

  constructor(stream: ReadableStream<R>) {
    const _stream = getArgument(stream, 'stream', 'ReadableStream');

    if (!isReadableStream(_stream)) {
      throw new InvalidArgTypeError('stream', 'ReadableStream', _stream);
    }

    if (isReadableStreamLocked(_stream)) {
      throw newNoOwner();
    }

    readableStreamReaderSetup(this, _stream);

    this._readRequests = new Queue();
  }

  get closed(): Promise<undefined> {
    if (!isReadableStreamDefaultReader(this)) {
      newIsntRsError('closed');
    }

    return this._closedPromise;
  }

  cancel(reason: any): Promise<void> {
    if (!isReadableStreamDefaultReader(this)) {
      return Promise.reject(newIsntRsError('cancel'));
    }

    if (this._ownerReadableStream === undefined) {
      return Promise.reject();
    }

    return readableStreamReaderClose(this, reason);
  }

  read(): Promise<ReadableStreamDefaultReadResult<R>> {
    if (!isReadableStreamDefaultReader(this)) {
      return promiseRejectedWith(newIsntRsError('read'));
    }

    if (this._ownerReadableStream === undefined) {
      return promiseRejectedWith(newNoOwner());
    }

    let resolvePromise!: (result: ReadableStreamDefaultReadResult<R>) => void;
    let rejectPromise!: (reason: any) => void;
    const promise = newPromise<ReadableStreamDefaultReadResult<R>>(
      (resolve, reject) => {
        resolvePromise = resolve;
        rejectPromise = reject;
      },
    );
    const readRequest: ReadRequest<R> = {
      _chunkSteps: (chunk) => resolvePromise({ value: chunk, done: false }),
      _closeSteps: () => resolvePromise({ value: undefined, done: true }),
      _errorSteps: (e) => rejectPromise(e),
    };
    readableStreamDefaultReaderRead(this, readRequest);
    return promise;
  }

  releaseLock(): void {
    if (!isReadableStreamDefaultReader(this)) {
      throw newIsntRsError('releaseLock');
    }

    if (this._ownerReadableStream === undefined) {
      return;
    }

    releaseReadableStreamReader(this);
  }
}

const readableStreamDefaultReaderRead = <R>(
  reader: ReadableStreamDefaultReader<R>,
  readRequest: ReadRequest<R>,
): void => {
  const stream = reader._ownerReadableStream;

  assert(stream !== undefined, 'stream !== undefined');

  stream._disturbed = true;

  if (stream._state === 'closed') {
    readRequest._closeSteps();
  } else if (stream._state === 'errored') {
    readRequest._errorSteps(stream._storedError);
  } else {
    assert(stream._state === 'readable', "Invalid state, expected 'readable'");
    stream._readableStreamController[pullStepsSymbol](
      readRequest as ReadRequest<any>,
    );
  }
};

export const releaseReadableStreamReader = <R>(
  reader: ReadableStreamDefaultReader<R>,
): void => {
  releaseReadableStreamReaderBase(reader);
  readableStreamDefaultReaderError(
    reader,
    new TypeError('Reader was released'),
  );
};

export const readableStreamDefaultReaderError = <R>(
  reader: ReadableStreamDefaultReader<R>,
  e: any,
): void => {
  const readRequests = reader._readRequests;
  reader._readRequests = new Queue();
  readRequests.forEach((readRequest) => {
    readRequest._errorSteps(e);
  });
};

const newIsntRsError = (text: string) =>
  new TypeError(
    `ReadableStreamDefaultReader.${text} can only be used on a ReadableStreamDefaultReader`,
  );

const newNoOwner = () =>
  new TypeError('ReadableStreamDefaultReader has no owner ReadableStream');

export const fulfillReadRequest = <R>(
  stream: ReadableStream<R>,
  chunk: R | undefined,
  done: boolean,
) => {
  const reader = stream._reader as ReadableStreamDefaultReader<R>;

  assert(
    reader._readRequests.length > 0,
    'There must be at least one read request',
  );

  const readRequest = reader._readRequests.shift()!;
  if (done) {
    readRequest._closeSteps();
  } else {
    readRequest._chunkSteps(chunk!);
  }
};

export const readableStreamGetNumReadRequests = <R>(
  stream: ReadableStream<R>,
): number => {
  return (stream._reader as ReadableStreamDefaultReader<R>)._readRequests
    .length;
};

export const readableStreamHasDefaultReader = (
  stream: ReadableStream,
): boolean => {
  const reader = stream._reader;

  if (reader === undefined) {
    return false;
  }

  if (!isReadableStreamDefaultReader(reader)) {
    return false;
  }

  return true;
};

export const readableStreamAddReadRequest = <R>(
  stream: ReadableStream<R>,
  readRequest: ReadRequest<R>,
): void => {
  assert(
    isReadableStreamDefaultReader(stream._reader),
    'stream._reader is a ReadableStreamDefaultReader',
  );
  assert(stream._state === 'readable', 'stream._state is readable');

  (stream._reader! as ReadableStreamDefaultReader<R>)._readRequests.push(
    readRequest,
  );
};
