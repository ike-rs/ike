import { getArgument, isObject } from '@std/_internal_';
import { Queue, resetQueue } from './queue';
import {
  isReadableStreamLocked,
  ReadableStream,
  readableStreamClose,
  readableStreamError,
  type ReadableByteStream,
} from './readable-stream';
import {
  arrayBufferSlice,
  copyDataBlockBytes,
  isDetachedBuffer,
  transferArrayBuffer,
  type ArrayBufferViewConstructor,
  type NonShared,
  type TypedArrayConstructor,
} from './utils';
import {
  fulfillReadIntoRequest,
  isReadableStreamBYOBReader,
  readableStreamGetNumReadIntoRequests,
  readableStreamHasBYOBReader,
} from './readers/byob';
import { assert } from '@std/assert';
import { convertULongLongWithEnforceRange, uponPromise } from './webidl';
import {
  fulfillReadRequest,
  isReadableStreamDefaultReader,
  readableStreamAddReadRequest,
  ReadableStreamDefaultReader,
  readableStreamGetNumReadRequests,
  readableStreamHasDefaultReader,
  type ReadRequest,
} from './readers/default';
import {
  cancelStepsSymbol,
  pullStepsSymbol,
  releaseStepsSymbol,
} from './symbols';

type PullIntoDescriptor<
  T extends NonShared<ArrayBufferView> = NonShared<ArrayBufferView>,
> = DefaultPullIntoDescriptor | BYOBPullIntoDescriptor<T>;

interface DefaultPullIntoDescriptor {
  buffer: ArrayBuffer;
  bufferByteLength: number;
  byteOffset: number;
  byteLength: number;
  bytesFilled: number;
  minimumFill: number;
  elementSize: number;
  viewConstructor: TypedArrayConstructor<Uint8Array>;
  readerType: 'default' | 'none';
}

interface BYOBPullIntoDescriptor<
  T extends NonShared<ArrayBufferView> = NonShared<ArrayBufferView>,
> {
  buffer: ArrayBuffer;
  bufferByteLength: number;
  byteOffset: number;
  byteLength: number;
  bytesFilled: number;
  minimumFill: number;
  elementSize: number;
  viewConstructor: ArrayBufferViewConstructor<T>;
  readerType: 'byob' | 'none';
}

export class ReadableStreamBYOBRequest {
  _associatedReadableByteStreamController!: ReadableByteStreamController;
  _view!: NonShared<ArrayBufferView> | null;

  private constructor() {
    throw new TypeError('Illegal constructor');
  }

  get view(): ArrayBufferView | null {
    if (!isReadableStreamBYOBReader(this)) {
      throw newIsntByobError('view');
    }

    return this._view;
  }

  respond(_bytesWritten: number): void;
  respond(_bytesWritten: number | undefined): void {
    if (!isReadableStreamBYOBReader(this)) {
      throw newIsntByobError('respond');
    }
    let bytesWritten = getArgument(
      _bytesWritten,
      'bytesWritten',
      'ReadableStreamBYOBRequest.respond',
    );
    bytesWritten = convertULongLongWithEnforceRange(
      bytesWritten,
      'First parameter',
    );

    if (this._associatedReadableByteStreamController === undefined) {
      throw new TypeError('This BYOB request has been invalidated');
    }

    if (isDetachedBuffer(this._view!.buffer)) {
      throw new TypeError(
        `The BYOB request's buffer has been detached and so cannot be used as a response`,
      );
    }

    assert(
      this._view!.byteLength > 0,
      'The BYOB request view has a 0 byte length',
    );
    assert(
      this._view!.buffer.byteLength > 0,
      'The BYOB request view has a 0 byte length buffer',
    );

    readableByteStreamRespond(
      this._associatedReadableByteStreamController,
      bytesWritten,
    );
  }

  respondWithNewView(_view: ArrayBufferView): void;
  respondWithNewView(_view: NonShared<ArrayBufferView>): void {
    if (!isReadableStreamBYOBReader(this)) {
      throw newIsntByobError('respondWithNewView');
    }
    let view = getArgument(
      _view,
      'view',
      'ReadableStreamBYOBRequest.respondWithNewView',
    ) as NonShared<ArrayBufferView>;

    if (!ArrayBuffer.isView(view)) {
      throw new TypeError('You can only respond with array buffer views');
    }

    if (this._associatedReadableByteStreamController === undefined) {
      throw new TypeError('This BYOB request has been invalidated');
    }

    // @ts-ignore
    if (isDetachedBuffer(view.buffer)) {
      throw new TypeError(
        "The given view's buffer has been detached and so cannot be used as a response",
      );
    }

    readableByteStreamRespondWithNewView(
      this._associatedReadableByteStreamController,
      view,
    );
  }
}

export const readableByteStreamRespond = (
  controller: ReadableByteStreamController,
  bytesWritten: number,
) => {
  assert(
    controller._pendingPullIntos.length > 0,
    'There must be at least one pending pull into descriptor',
  );

  const firstDescriptor = controller._pendingPullIntos.peek();
  const state = controller._controlledReadableByteStream._state;

  if (state === 'closed') {
    if (bytesWritten !== 0) {
      throw new TypeError(
        'bytesWritten must be 0 when calling respond() on a closed stream',
      );
    }
  } else {
    assert(state === 'readable', 'state must be readable');
    if (bytesWritten === 0) {
      throw new TypeError(
        'bytesWritten must be greater than 0 when calling respond() on a readable stream',
      );
    }
    if (
      firstDescriptor.bytesFilled + bytesWritten >
      firstDescriptor.byteLength
    ) {
      throw new RangeError('bytesWritten out of range');
    }
  }

  firstDescriptor.buffer = transferArrayBuffer(firstDescriptor.buffer);

  readableByteStreamRespondInternal(controller, bytesWritten);
};

export const readableByteStreamRespondWithNewView = (
  controller: ReadableByteStreamController,
  view: NonShared<ArrayBufferView>,
) => {
  assert(
    controller._pendingPullIntos.length > 0,
    'There must be at least one pending pull into descriptor',
  );
  assert(
    !isDetachedBuffer(view.buffer),
    'The buffer for the new view must not be detached',
  );

  const firstDescriptor = controller._pendingPullIntos.peek();
  const state = controller._controlledReadableByteStream._state;

  if (state === 'closed') {
    if (view.byteLength !== 0) {
      throw new TypeError(
        "The view's length must be 0 when calling respondWithNewView() on a closed stream",
      );
    }
  } else {
    assert(state === 'readable', 'state must be readable');
    if (view.byteLength === 0) {
      throw new TypeError(
        "The view's length must be greater than 0 when calling respondWithNewView() on a readable stream",
      );
    }
  }

  if (
    firstDescriptor.byteOffset + firstDescriptor.bytesFilled !==
    view.byteOffset
  ) {
    throw new RangeError(
      'The region specified by view does not match byobRequest',
    );
  }
  if (firstDescriptor.bufferByteLength !== view.buffer.byteLength) {
    throw new RangeError(
      'The buffer of view has different capacity than byobRequest',
    );
  }
  if (
    firstDescriptor.bytesFilled + view.byteLength >
    firstDescriptor.byteLength
  ) {
    throw new RangeError(
      'The region specified by view is larger than byobRequest',
    );
  }

  const viewByteLength = view.byteLength;
  firstDescriptor.buffer = transferArrayBuffer(view.buffer);
  readableByteStreamRespondInternal(controller, viewByteLength);
};

export const readableByteStreamRespondInternal = (
  controller: ReadableByteStreamController,
  bytesWritten: number,
) => {
  const firstDescriptor = controller._pendingPullIntos.peek();
  assert(
    !isDetachedBuffer(firstDescriptor.buffer),
    'The buffer must be transferable',
  );

  invalidateBYOBRequest(controller);

  const state = controller._controlledReadableByteStream._state;
  if (state === 'closed') {
    assert(bytesWritten === 0, 'bytesWritten must be 0');
    respondInClosedState(controller, firstDescriptor);
  } else {
    assert(state === 'readable', 'state must be readable');
    assert(bytesWritten > 0, 'bytesWritten must be greater than 0');
    responseInReadableState(controller, bytesWritten, firstDescriptor);
  }

  callPullIfNeeded(controller);
};

export const shouldCallPull = (
  controller: ReadableByteStreamController,
): boolean => {
  const stream = controller._controlledReadableByteStream;

  if (stream._state !== 'readable') {
    return false;
  }

  if (controller._closeRequested) {
    return false;
  }

  if (!controller._started) {
    return false;
  }

  if (
    readableStreamHasDefaultReader(stream) &&
    readableStreamGetNumReadRequests(stream) > 0
  ) {
    return true;
  }

  if (
    readableStreamHasBYOBReader(stream) &&
    readableStreamGetNumReadIntoRequests(stream) > 0
  ) {
    return true;
  }

  const desiredSize = getDesiredSize(controller);
  assert(desiredSize !== null, 'desiredSize is not null');
  if (desiredSize! > 0) {
    return true;
  }

  return false;
};

export const getDesiredSize = (
  controller: ReadableByteStreamController,
): number | null => {
  const state = controller._controlledReadableByteStream._state;

  if (state === 'errored') {
    return null;
  }
  if (state === 'closed') {
    return 0;
  }

  return controller._strategyHWM - controller._queueTotalSize;
};

export const callPullIfNeeded = (
  controller: ReadableByteStreamController,
): void => {
  const shouldPull = shouldCallPull(controller);
  if (!shouldPull) {
    return;
  }

  if (controller._pulling) {
    controller._pullAgain = true;
    return;
  }

  assert(!controller._pullAgain, '');

  controller._pulling = true;

  const pullPromise = controller._pullAlgorithm();
  uponPromise(
    pullPromise,
    () => {
      controller._pulling = false;

      if (controller._pullAgain) {
        controller._pullAgain = false;
        callPullIfNeeded(controller);
      }

      return null;
    },
    (e: any) => {
      controllerError(controller, e);
      return null;
    },
  );
};

export const fillHeadPullIntoDescriptor = (
  controller: ReadableByteStreamController,
  size: number,
  pullIntoDescriptor: PullIntoDescriptor,
) => {
  assert(
    controller._pendingPullIntos.length === 0 ||
      controller._pendingPullIntos.peek() === pullIntoDescriptor,
    '',
  );
  assert(controller._byobRequest === null, 'controller._byobRequest === null');
  pullIntoDescriptor.bytesFilled += size;
};

export const enqueueChunkToQueue = (
  controller: ReadableByteStreamController,
  buffer: ArrayBuffer,
  byteOffset: number,
  byteLength: number,
) => {
  controller._queue.push({ buffer, byteOffset, byteLength });
  controller._queueTotalSize += byteLength;
};

export const controllerError = (
  controller: ReadableByteStreamController,
  e: any,
) => {
  const stream = controller._controlledReadableByteStream;

  if (stream._state !== 'readable') {
    return;
  }

  clearPendingPullIntos(controller);

  // @ts-ignore
  resetQueue(controller);
  controllerClearAlgorithms(controller);

  readableStreamError(stream, e);
};

export const clearPendingPullIntos = (
  controller: ReadableByteStreamController,
) => {
  invalidateBYOBRequest(controller);
  controller._pendingPullIntos = new Queue();
};

export const controllerClearAlgorithms = (
  controller: ReadableByteStreamController,
) => {
  controller._pullAlgorithm = undefined!;
  controller._cancelAlgorithm = undefined!;
};

export const enqueueClonedChunkToQueue = (
  controller: ReadableByteStreamController,
  buffer: ArrayBuffer,
  byteOffset: number,
  byteLength: number,
) => {
  let clonedChunk;
  try {
    clonedChunk = arrayBufferSlice(buffer, byteOffset, byteOffset + byteLength);
  } catch (cloneE) {
    controllerError(controller, cloneE);
    throw cloneE;
  }
  enqueueChunkToQueue(controller, clonedChunk, 0, byteLength);
};

export const enqueueDetachedPullIntoToQueue = (
  controller: ReadableByteStreamController,
  firstDescriptor: PullIntoDescriptor,
) => {
  assert(firstDescriptor.readerType === 'none', '');
  if (firstDescriptor.bytesFilled > 0) {
    enqueueClonedChunkToQueue(
      controller,
      firstDescriptor.buffer,
      firstDescriptor.byteOffset,
      firstDescriptor.bytesFilled,
    );
  }
  shiftPendingPullInto(controller);
};

export const processPullIntoDescriptorsUsingQueue = (
  controller: ReadableByteStreamController,
) => {
  assert(!controller._closeRequested, 'controller._closeRequested is false');

  while (controller._pendingPullIntos.length > 0) {
    if (controller._queueTotalSize === 0) {
      return;
    }

    const pullIntoDescriptor = controller._pendingPullIntos.peek();
    assert(pullIntoDescriptor.readerType !== 'none', '');

    if (fillPullIntoDescriptorFromQueue(controller, pullIntoDescriptor)) {
      shiftPendingPullInto(controller);

      commitPullIntoDescriptor(
        controller._controlledReadableByteStream,
        pullIntoDescriptor,
      );
    }
  }
};

export const fillPullIntoDescriptorFromQueue = (
  controller: ReadableByteStreamController,
  pullIntoDescriptor: PullIntoDescriptor,
) => {
  const maxBytesToCopy = Math.min(
    controller._queueTotalSize,
    pullIntoDescriptor.byteLength - pullIntoDescriptor.bytesFilled,
  );
  const maxBytesFilled = pullIntoDescriptor.bytesFilled + maxBytesToCopy;

  let totalBytesToCopyRemaining = maxBytesToCopy;
  let ready = false;
  assert(pullIntoDescriptor.bytesFilled < pullIntoDescriptor.minimumFill, '');
  const remainderBytes = maxBytesFilled % pullIntoDescriptor.elementSize;
  const maxAlignedBytes = maxBytesFilled - remainderBytes;
  if (maxAlignedBytes >= pullIntoDescriptor.minimumFill) {
    totalBytesToCopyRemaining =
      maxAlignedBytes - pullIntoDescriptor.bytesFilled;
    ready = true;
  }

  const queue = controller._queue;

  while (totalBytesToCopyRemaining > 0) {
    const headOfQueue = queue.peek();

    const bytesToCopy = Math.min(
      totalBytesToCopyRemaining,
      headOfQueue.byteLength,
    );

    const destStart =
      pullIntoDescriptor.byteOffset + pullIntoDescriptor.bytesFilled;
    copyDataBlockBytes(
      pullIntoDescriptor.buffer,
      destStart,
      headOfQueue.buffer,
      headOfQueue.byteOffset,
      bytesToCopy,
    );

    if (headOfQueue.byteLength === bytesToCopy) {
      queue.shift();
    } else {
      headOfQueue.byteOffset += bytesToCopy;
      headOfQueue.byteLength -= bytesToCopy;
    }
    controller._queueTotalSize -= bytesToCopy;

    fillHeadPullIntoDescriptor(controller, bytesToCopy, pullIntoDescriptor);

    totalBytesToCopyRemaining -= bytesToCopy;
  }

  if (!ready) {
    assert(controller._queueTotalSize === 0, '');
    assert(pullIntoDescriptor.bytesFilled > 0, '');
    assert(pullIntoDescriptor.bytesFilled < pullIntoDescriptor.minimumFill, '');
  }

  return ready;
};

export const responseInReadableState = (
  controller: ReadableByteStreamController,
  bytesWritten: number,
  pullIntoDescriptor: PullIntoDescriptor,
) => {
  assert(
    pullIntoDescriptor.bytesFilled + bytesWritten <=
      pullIntoDescriptor.byteLength,
    '',
  );

  fillHeadPullIntoDescriptor(controller, bytesWritten, pullIntoDescriptor);

  if (pullIntoDescriptor.readerType === 'none') {
    enqueueDetachedPullIntoToQueue(controller, pullIntoDescriptor);
    processPullIntoDescriptorsUsingQueue(controller);
    return;
  }

  if (pullIntoDescriptor.bytesFilled < pullIntoDescriptor.minimumFill) {
    return;
  }

  shiftPendingPullInto(controller);

  const remainderSize =
    pullIntoDescriptor.bytesFilled % pullIntoDescriptor.elementSize;
  if (remainderSize > 0) {
    const end = pullIntoDescriptor.byteOffset + pullIntoDescriptor.bytesFilled;
    enqueueClonedChunkToQueue(
      controller,
      pullIntoDescriptor.buffer,
      end - remainderSize,
      remainderSize,
    );
  }

  pullIntoDescriptor.bytesFilled -= remainderSize;
  commitPullIntoDescriptor(
    controller._controlledReadableByteStream,
    pullIntoDescriptor,
  );

  processPullIntoDescriptorsUsingQueue(controller);
};

export const respondInClosedState = (
  controller: ReadableByteStreamController,
  firstDescriptor: PullIntoDescriptor,
) => {
  assert(firstDescriptor.bytesFilled % firstDescriptor.elementSize === 0, '');

  if (firstDescriptor.readerType === 'none') {
    shiftPendingPullInto(controller);
  }

  const stream = controller._controlledReadableByteStream;
  if (readableStreamHasBYOBReader(stream)) {
    while (readableStreamGetNumReadIntoRequests(stream) > 0) {
      const pullIntoDescriptor = shiftPendingPullInto(controller);
      commitPullIntoDescriptor(stream, pullIntoDescriptor);
    }
  }
};

export const commitPullIntoDescriptor = <T extends NonShared<ArrayBufferView>>(
  stream: ReadableByteStream,
  pullIntoDescriptor: PullIntoDescriptor<T>,
) => {
  assert(stream._state !== 'errored', 'state must not be errored');
  assert(
    pullIntoDescriptor.readerType !== 'none',
    'readerType must not be none',
  );

  let done = false;
  if (stream._state === 'closed') {
    assert(
      pullIntoDescriptor.bytesFilled % pullIntoDescriptor.elementSize === 0,
      '',
    );
    done = true;
  }

  const filledView = convertPullIntoDescriptor<T>(pullIntoDescriptor);
  if (pullIntoDescriptor.readerType === 'default') {
    fulfillReadRequest(
      stream,
      filledView as unknown as NonShared<Uint8Array>,
      done,
    );
  } else {
    assert(pullIntoDescriptor.readerType === 'byob', 'readerType must be byob');
    fulfillReadIntoRequest(stream, filledView, done);
  }
};

export const convertPullIntoDescriptor = <T extends NonShared<ArrayBufferView>>(
  pullIntoDescriptor: PullIntoDescriptor<T>,
): T => {
  const bytesFilled = pullIntoDescriptor.bytesFilled;
  const elementSize = pullIntoDescriptor.elementSize;

  assert(bytesFilled <= pullIntoDescriptor.byteLength, '');
  assert(bytesFilled % elementSize === 0, '');

  return new pullIntoDescriptor.viewConstructor(
    pullIntoDescriptor.buffer,
    pullIntoDescriptor.byteOffset,
    bytesFilled / elementSize,
  ) as T;
};

export const shiftPendingPullInto = (
  controller: ReadableByteStreamController,
): PullIntoDescriptor => {
  assert(controller._byobRequest === null, 'controller._byobRequest === null');
  const descriptor = controller._pendingPullIntos.shift()!;
  return descriptor;
};

export const invalidateBYOBRequest = (
  controller: ReadableByteStreamController,
) => {
  if (controller._byobRequest === null) {
    return;
  }

  controller._byobRequest._associatedReadableByteStreamController = undefined!;
  controller._byobRequest._view = null!;
  controller._byobRequest = null;
};

const newIsntByobError = (method: string) => {
  return new TypeError(
    `ReadableStreamBYOBRequest.${method} can only be used on a ReadableStreamBYOBRequest`,
  );
};

interface ByteQueueElement {
  buffer: ArrayBuffer;
  byteOffset: number;
  byteLength: number;
}

export class ReadableByteStreamController {
  _controlledReadableByteStream!: ReadableByteStream;
  _queue!: Queue<ByteQueueElement>;
  _queueTotalSize!: number;
  _started!: boolean;
  _closeRequested!: boolean;
  _pullAgain!: boolean;
  _pulling!: boolean;
  _strategyHWM!: number;
  _pullAlgorithm!: () => Promise<void>;
  _cancelAlgorithm!: (reason: any) => Promise<void>;
  _autoAllocateChunkSize: number | undefined;
  _byobRequest: ReadableStreamBYOBRequest | null;
  _pendingPullIntos!: Queue<PullIntoDescriptor>;

  private constructor() {
    throw new TypeError('Illegal constructor');
  }

  get byobRequest(): ReadableStreamBYOBRequest | null {
    if (!isReadableByteStreamController(this)) {
      throw newIsntByobError('byobRequest');
    }

    return getBYOBRequest(this);
  }

  get desiredSize(): number | null {
    if (!isReadableByteStreamController(this)) {
      throw newIsntByobError('desiredSize');
    }

    return getDesiredSize(this);
  }

  close(): void {
    if (!isReadableByteStreamController(this)) {
      throw newIsntByobError('close');
    }

    if (this._closeRequested) {
      throw new TypeError(
        'The stream has already been closed; do not close it again!',
      );
    }

    const state = this._controlledReadableByteStream._state;
    if (state !== 'readable') {
      throw new TypeError(
        `The stream (in ${state} state) is not in the readable state and cannot be closed`,
      );
    }

    controllerClose(this);
  }

  enqueue(_chunk: ArrayBufferView): void;
  enqueue(_chunk: NonShared<ArrayBufferView>): void {
    if (!isReadableByteStreamController(this)) {
      throw newIsntByobError('enqueue');
    }
    const chunk = getArgument(
      _chunk,
      'chunk',
      'ReadableByteStreamController.enqueue',
    ) as NonShared<ArrayBufferView>;

    if (!ArrayBuffer.isView(chunk)) {
      throw new TypeError('chunk must be an array buffer view');
    }
    if (chunk.byteLength === 0) {
      throw new TypeError('chunk must have non-zero byteLength');
    }
    if (chunk.buffer.byteLength === 0) {
      throw new TypeError(`chunk's buffer must have non-zero byteLength`);
    }

    if (this._closeRequested) {
      throw new TypeError('stream is closed or draining');
    }

    const state = this._controlledReadableByteStream._state;
    if (state !== 'readable') {
      throw new TypeError(
        `The stream (in ${state} state) is not in the readable state and cannot be enqueued to`,
      );
    }

    controllerEnqueue(this, chunk);
  }

  error(e: any = undefined): void {
    if (!isReadableByteStreamController(this)) {
      throw newIsntByobError('error');
    }

    controllerError(this, e);
  }

  [cancelStepsSymbol](reason: any): Promise<void> {
    clearPendingPullIntos(this);

    // @ts-ignore
    resetQueue(this);

    const result = this._cancelAlgorithm(reason);
    controllerClearAlgorithms(this);
    return result;
  }

  [pullStepsSymbol](readRequest: ReadRequest<NonShared<Uint8Array>>): void {
    const stream = this._controlledReadableByteStream;
    assert(readableStreamHasDefaultReader(stream), '');

    if (this._queueTotalSize > 0) {
      assert(readableStreamGetNumReadRequests(stream) === 0, '');

      fillReadRequestFromQueue(this, readRequest);
      return;
    }

    const autoAllocateChunkSize = this._autoAllocateChunkSize;
    if (autoAllocateChunkSize !== undefined) {
      let buffer: ArrayBuffer;
      try {
        buffer = new ArrayBuffer(autoAllocateChunkSize);
      } catch (bufferE) {
        readRequest._errorSteps(bufferE);
        return;
      }

      const pullIntoDescriptor: DefaultPullIntoDescriptor = {
        buffer,
        bufferByteLength: autoAllocateChunkSize,
        byteOffset: 0,
        byteLength: autoAllocateChunkSize,
        bytesFilled: 0,
        minimumFill: 1,
        elementSize: 1,
        viewConstructor: Uint8Array,
        readerType: 'default',
      };

      this._pendingPullIntos.push(pullIntoDescriptor);
    }

    readableStreamAddReadRequest(stream, readRequest);
    callPullIfNeeded(this);
  }

  [releaseStepsSymbol](): void {
    if (this._pendingPullIntos.length > 0) {
      const firstPullInto = this._pendingPullIntos.peek();
      firstPullInto.readerType = 'none';

      this._pendingPullIntos = new Queue();
      this._pendingPullIntos.push(firstPullInto);
    }
  }
}

export const processReadRequestsUsingQueue = (
  controller: ReadableByteStreamController,
) => {
  const reader = controller._controlledReadableByteStream._reader;
  assert(isReadableStreamDefaultReader(reader), '');
  // @ts-ignore
  while (reader._readRequests.length > 0) {
    if (controller._queueTotalSize === 0) {
      return;
    }
    // @ts-ignore
    const readRequest = reader._readRequests.shift();
    fillReadRequestFromQueue(controller, readRequest);
  }
};

export const fillReadRequestFromQueue = (
  controller: ReadableByteStreamController,
  readRequest: ReadRequest<NonShared<Uint8Array>>,
) => {
  assert(controller._queueTotalSize > 0, '');

  const entry = controller._queue.shift();
  controller._queueTotalSize -= entry.byteLength;

  handleQueueDrain(controller);

  const view = new Uint8Array(entry.buffer, entry.byteOffset, entry.byteLength);
  readRequest._chunkSteps(view as NonShared<Uint8Array>);
};

export const handleQueueDrain = (controller: ReadableByteStreamController) => {
  assert(controller._controlledReadableByteStream._state === 'readable', '');

  if (controller._queueTotalSize === 0 && controller._closeRequested) {
    controllerClearAlgorithms(controller);
    readableStreamClose(controller._controlledReadableByteStream);
  } else {
    callPullIfNeeded(controller);
  }
};

export const controllerEnqueue = (
  controller: ReadableByteStreamController,
  chunk: NonShared<ArrayBufferView>,
) => {
  const stream = controller._controlledReadableByteStream;

  if (controller._closeRequested || stream._state !== 'readable') {
    return;
  }

  const { buffer, byteOffset, byteLength } = chunk;
  if (isDetachedBuffer(buffer)) {
    throw new TypeError("chunk's buffer is detached and so cannot be enqueued");
  }
  const transferredBuffer = transferArrayBuffer(buffer);

  if (controller._pendingPullIntos.length > 0) {
    const firstPendingPullInto = controller._pendingPullIntos.peek();
    if (isDetachedBuffer(firstPendingPullInto.buffer)) {
      throw new TypeError(
        "The BYOB request's buffer has been detached and so cannot be filled with an enqueued chunk",
      );
    }
    invalidateBYOBRequest(controller);
    firstPendingPullInto.buffer = transferArrayBuffer(
      firstPendingPullInto.buffer,
    );
    if (firstPendingPullInto.readerType === 'none') {
      enqueueDetachedPullIntoToQueue(controller, firstPendingPullInto);
    }
  }

  if (readableStreamHasDefaultReader(stream)) {
    processReadRequestsUsingQueue(controller);
    if (readableStreamGetNumReadRequests(stream) === 0) {
      assert(controller._pendingPullIntos.length === 0, '');
      enqueueChunkToQueue(
        controller,
        transferredBuffer,
        byteOffset,
        byteLength,
      );
    } else {
      assert(controller._queue.length === 0, '');
      if (controller._pendingPullIntos.length > 0) {
        assert(
          controller._pendingPullIntos.peek().readerType === 'default',
          '',
        );
        shiftPendingPullInto(controller);
      }
      const transferredView = new Uint8Array(
        transferredBuffer,
        byteOffset,
        byteLength,
      );
      fulfillReadRequest(
        stream,
        transferredView as NonShared<Uint8Array>,
        false,
      );
    }
  } else if (readableStreamHasBYOBReader(stream)) {
    enqueueChunkToQueue(controller, transferredBuffer, byteOffset, byteLength);
    processPullIntoDescriptorsUsingQueue(controller);
  } else {
    assert(
      !isReadableStreamLocked(stream),
      'readable stream must not be locked',
    );
    enqueueChunkToQueue(controller, transferredBuffer, byteOffset, byteLength);
  }

  callPullIfNeeded(controller);
};

export const controllerClose = (controller: ReadableByteStreamController) => {
  const stream = controller._controlledReadableByteStream;

  if (controller._closeRequested || stream._state !== 'readable') {
    return;
  }

  if (controller._queueTotalSize > 0) {
    controller._closeRequested = true;

    return;
  }

  if (controller._pendingPullIntos.length > 0) {
    const firstPendingPullInto = controller._pendingPullIntos.peek();
    if (
      firstPendingPullInto.bytesFilled % firstPendingPullInto.elementSize !==
      0
    ) {
      const e = new TypeError(
        'Insufficient bytes to fill elements in the given buffer',
      );
      controllerError(controller, e);

      throw e;
    }
  }

  controllerClearAlgorithms(controller);
  readableStreamClose(stream);
};

export const getBYOBRequest = (
  controller: ReadableByteStreamController,
): ReadableStreamBYOBRequest | null => {
  if (
    controller._byobRequest === null &&
    controller._pendingPullIntos.length > 0
  ) {
    const firstDescriptor = controller._pendingPullIntos.peek();
    const view = new Uint8Array(
      firstDescriptor.buffer,
      firstDescriptor.byteOffset + firstDescriptor.bytesFilled,
      firstDescriptor.byteLength - firstDescriptor.bytesFilled,
    );

    const byobRequest: ReadableStreamBYOBRequest = Object.create(
      ReadableStreamBYOBRequest.prototype,
    );
    setUpReadableStreamBYOBRequest(
      byobRequest,
      controller,
      view as NonShared<Uint8Array>,
    );
    controller._byobRequest = byobRequest;
  }
  return controller._byobRequest;
};

export const setUpReadableStreamBYOBRequest = (
  request: ReadableStreamBYOBRequest,
  controller: ReadableByteStreamController,
  view: NonShared<ArrayBufferView>,
) => {
  assert(
    isReadableByteStreamController(controller),
    'controller must be a ReadableByteStreamController',
  );
  assert(typeof view === 'object', 'view must be an object');
  assert(ArrayBuffer.isView(view), 'view must be an ArrayBufferView');
  assert(!isDetachedBuffer(view.buffer), 'view.buffer must not be detached');
  request._associatedReadableByteStreamController = controller;
  request._view = view;
};

export const isReadableByteStreamController = (
  x: any,
): x is ReadableByteStreamController => {
  if (!isObject(x)) {
    return false;
  }

  if (
    !Object.prototype.hasOwnProperty.call(x, '_controlledReadableByteStream')
  ) {
    return false;
  }

  return x instanceof ReadableByteStreamController;
};
