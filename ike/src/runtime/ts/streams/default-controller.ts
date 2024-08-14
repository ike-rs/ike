import { isObject } from '@std/_internal_';
import {
  dequeueValue,
  enqueueValueWithSize,
  resetQueue,
  type Queue,
  type QueuePair,
  type QueuingStrategySizeCallback,
} from './queue';
import {
  isReadableStreamLocked,
  readableStreamClose,
  readableStreamError,
  type ReadableStream,
} from './readable-stream';
import {
  fulfillReadRequest,
  readableStreamAddReadRequest,
  readableStreamGetNumReadRequests,
  type ReadRequest,
} from './readers/default';
import { uponPromise } from './webidl';
import { assert } from '@std/assert';
import {
  cancelStepsSymbol,
  pullStepsSymbol,
  releaseStepsSymbol,
} from './symbols';

export const isReadableStreamDefaultController = <R = any>(
  x: any,
): x is ReadableStreamDefaultController<R> => {
  if (!isObject(x)) {
    return false;
  }

  if (!Object.prototype.hasOwnProperty.call(x, '_controlledReadableStream')) {
    return false;
  }

  return x instanceof ReadableStreamDefaultController;
};

export class ReadableStreamDefaultController<R> {
  _controlledReadableStream!: ReadableStream<R>;
  _queue!: Queue<QueuePair<R>>;
  _queueTotalSize!: number;
  _started!: boolean;
  _closeRequested!: boolean;
  _pullAgain!: boolean;
  _pulling!: boolean;
  _strategySizeAlgorithm!: QueuingStrategySizeCallback<R>;
  _strategyHWM!: number;
  _pullAlgorithm!: () => Promise<void>;
  _cancelAlgorithm!: (reason: any) => Promise<void>;

  private constructor() {
    throw new TypeError('Illegal constructor');
  }

  get desiredSize(): number | null {
    if (!isReadableStreamDefaultController(this)) {
      throw newIsntRsdError('desiredSize');
    }

    return getDefaultDesiredSize(this);
  }

  close(): void {
    if (!isReadableStreamDefaultController(this)) {
      throw newIsntRsdError('close');
    }

    if (!defaultCanCloseOrEnqueue(this)) {
      throw new TypeError('The stream is not in a state that permits close');
    }

    defaultControllerClose(this);
  }

  enqueue(chunk: R): void;
  enqueue(chunk: R = undefined!): void {
    if (!isReadableStreamDefaultController(this)) {
      throw newIsntRsdError('equeue');
    }

    if (!defaultCanCloseOrEnqueue(this)) {
      throw new TypeError('The stream is not in a state that permits enqueue');
    }

    return defaultControllerEnqueue(this, chunk);
  }

  error(e: any = undefined): void {
    if (!isReadableStreamDefaultController(this)) {
      throw newIsntRsdError('error');
    }

    defaultControllerError(this, e);
  }

  [cancelStepsSymbol](reason: any): Promise<void> {
    resetQueue(this);
    const result = this._cancelAlgorithm(reason);
    defaultClearAllAlgorithms(this);
    return result;
  }

  [pullStepsSymbol](readRequest: ReadRequest<R>): void {
    const stream = this._controlledReadableStream;

    if (this._queue.length > 0) {
      const chunk = dequeueValue(this);

      if (this._closeRequested && this._queue.length === 0) {
        defaultClearAllAlgorithms(this);
        readableStreamClose(stream);
      } else {
        defaultControllerCallPullIfNeeded(this);
      }

      readRequest._chunkSteps(chunk);
    } else {
      readableStreamAddReadRequest(stream, readRequest);
      defaultControllerCallPullIfNeeded(this);
    }
  }

  [releaseStepsSymbol](): void {}
}

const defaultControllerEnqueue = <R>(
  controller: ReadableStreamDefaultController<R>,
  chunk: R,
): void => {
  if (!defaultCanCloseOrEnqueue(controller)) {
    return;
  }

  const stream = controller._controlledReadableStream;

  if (
    isReadableStreamLocked(stream) &&
    readableStreamGetNumReadRequests(stream) > 0
  ) {
    fulfillReadRequest(stream, chunk, false);
  } else {
    let chunkSize;
    try {
      chunkSize = controller._strategySizeAlgorithm(chunk);
    } catch (chunkSizeE) {
      defaultControllerError(controller, chunkSizeE);
      throw chunkSizeE;
    }

    try {
      enqueueValueWithSize(controller, chunk, chunkSize);
    } catch (enqueueE) {
      defaultControllerError(controller, enqueueE);
      throw enqueueE;
    }
  }

  defaultControllerCallPullIfNeeded(controller);
};

const defaultControllerShouldCallPull = (
  controller: ReadableStreamDefaultController<any>,
): boolean => {
  const stream = controller._controlledReadableStream;

  if (!defaultCanCloseOrEnqueue(controller)) {
    return false;
  }

  if (!controller._started) {
    return false;
  }

  if (
    isReadableStreamLocked(stream) &&
    readableStreamGetNumReadRequests(stream) > 0
  ) {
    return true;
  }

  const desiredSize = getDefaultDesiredSize(controller);
  assert(desiredSize !== null, 'desiredSize should not be null');
  if (desiredSize! > 0) {
    return true;
  }

  return false;
};

const defaultControllerCallPullIfNeeded = (
  controller: ReadableStreamDefaultController<any>,
): void => {
  const shouldPull = defaultControllerShouldCallPull(controller);
  if (!shouldPull) {
    return;
  }

  if (controller._pulling) {
    controller._pullAgain = true;
    return;
  }

  assert(!controller._pullAgain, 'pullAgain should be false');

  controller._pulling = true;

  const pullPromise = controller._pullAlgorithm();
  uponPromise(
    pullPromise,
    () => {
      controller._pulling = false;

      if (controller._pullAgain) {
        controller._pullAgain = false;
        defaultControllerCallPullIfNeeded(controller);
      }

      return null;
    },
    (e) => {
      defaultControllerError(controller, e);
      return null;
    },
  );
};

const defaultControllerError = (
  controller: ReadableStreamDefaultController<any>,
  e: any,
) => {
  const stream = controller._controlledReadableStream;

  if (stream._state !== 'readable') {
    return;
  }

  resetQueue(controller);

  defaultClearAllAlgorithms(controller);
  readableStreamError(stream, e);
};

const defaultControllerClose = (
  controller: ReadableStreamDefaultController<any>,
) => {
  if (!defaultCanCloseOrEnqueue(controller)) {
    return;
  }

  const stream = controller._controlledReadableStream;

  controller._closeRequested = true;

  if (controller._queue.length === 0) {
    defaultClearAllAlgorithms(controller);
    readableStreamClose(stream);
  }
};

const defaultClearAllAlgorithms = (
  controller: ReadableStreamDefaultController<any>,
) => {
  controller._pullAlgorithm = undefined!;
  controller._cancelAlgorithm = undefined!;
  controller._strategySizeAlgorithm = undefined!;
};

const defaultCanCloseOrEnqueue = (
  controller: ReadableStreamDefaultController<any>,
): boolean => {
  const state = controller._controlledReadableStream._state;

  if (!controller._closeRequested && state === 'readable') {
    return true;
  }

  return false;
};

const getDefaultDesiredSize = (
  controller: ReadableStreamDefaultController<any>,
): number | null => {
  const state = controller._controlledReadableStream._state;

  if (state === 'errored') {
    return null;
  }
  if (state === 'closed') {
    return 0;
  }

  return controller._strategyHWM - controller._queueTotalSize;
};

const newIsntRsdError = (name: string) =>
  new TypeError(
    `ReadableStreamDefaultController.${name} is not a ReadableStreamDefaultController`,
  );
