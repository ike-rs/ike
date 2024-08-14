import { assert } from '@std/assert';
import {
  cancelReadableStream,
  type ReadableStream,
  type ReadableStreamReader,
} from '../readable-stream';
import { newPromise, setPromiseIsHandledToTrue } from '../webidl';
import { releaseStepsSymbol } from '../symbols';

export * from './default';

export const readableStreamReaderSetup = <R>(
  reader: ReadableStreamReader<R>,
  stream: ReadableStream<R>,
) => {
  reader._ownerReadableStream = stream;
  stream._reader = reader;

  if (stream._state === 'readable') {
    closedPromiseInitialize(reader);
  } else if (stream._state === 'closed') {
    closedPromiseInitAsResolved(reader);
  } else {
    assert(stream._state === 'errored', "Invalid state, expected 'errored'");
    closedPromiseInitAsRejected(reader, stream._storedError);
  }
};

export const closedPromiseInitialize = (reader: ReadableStreamReader<any>) => {
  reader._closedPromise = newPromise((resolve, reject) => {
    reader._closedPromise_resolve = resolve;
    reader._closedPromise_reject = reject;
  });
};

export const closedPromiseInitAsResolved = (
  reader: ReadableStreamReader<any>,
) => {
  closedPromiseInitialize(reader);
  closedPromiseResolve(reader);
};

export const closedPromiseResolve = (reader: ReadableStreamReader<any>) => {
  if (reader._closedPromise_resolve === undefined) {
    return;
  }

  reader._closedPromise_resolve(undefined);
  reader._closedPromise_resolve = undefined;
  reader._closedPromise_reject = undefined;
};

export const closedPromiseInitAsRejected = (
  reader: ReadableStreamReader<any>,
  reason: any,
) => {
  closedPromiseInitialize(reader);
  closedPromiseReject(reader, reason);
};

export const closedPromiseReject = (
  reader: ReadableStreamReader<any>,
  reason: any,
) => {
  if (reader._closedPromise_reject === undefined) {
    return;
  }

  setPromiseIsHandledToTrue(reader._closedPromise);
  reader._closedPromise_reject(reason);
  reader._closedPromise_resolve = undefined;
  reader._closedPromise_reject = undefined;
};

export const readableStreamReaderClose = (
  reader: ReadableStreamReader<any>,
  reason: any,
): Promise<void> => {
  const stream = reader._ownerReadableStream;
  assert(
    stream !== undefined,
    'ReadableStreamReader has no owner ReadableStream',
  );
  return cancelReadableStream(stream, reason);
};

export const closedPromiseResetToRejected = (
  reader: ReadableStreamReader<any>,
  reason: any,
) => {
  assert(
    reader._closedPromise_resolve === undefined,
    'closedPromise_resolve is not undefined',
  );
  assert(
    reader._closedPromise_reject === undefined,
    'closedPromise_reject is not undefined',
  );

  closedPromiseInitAsRejected(reader, reason);
};

export const releaseReadableStreamReaderBase = <R>(
  reader: ReadableStreamReader<R>,
) => {
  const stream = reader._ownerReadableStream;
  assert(
    stream !== undefined,
    'ReadableStreamReader has no owner ReadableStream',
  );
  assert(
    stream._reader === reader,
    'ReadableStreamReader is not owner of ReadableStream',
  );

  if (stream._state === 'readable') {
    closedPromiseReject(
      reader,
      new TypeError(
        `Reader was released and can no longer be used to monitor the stream's closedness`,
      ),
    );
  } else {
    closedPromiseResetToRejected(
      reader,
      new TypeError(
        `Reader was released and can no longer be used to monitor the stream's closedness`,
      ),
    );
  }

  stream._readableStreamController[releaseStepsSymbol]();

  stream._reader = undefined;
  reader._ownerReadableStream = undefined!;
};
