import { assert } from '@std/assert';
import { isNonNegativeNumber } from './utils';

const QUEUE_MAX_ARRAY_SIZE = 16384;

interface Node<T> {
  _elements: T[];
  _next: Node<T> | undefined;
}

export class Queue<T> {
  private _front: Node<T>;
  private _back: Node<T>;
  private _cursor = 0;
  private _size = 0;

  constructor() {
    this._front = {
      _elements: [],
      _next: undefined,
    };
    this._back = this._front;
  }

  get length(): number {
    return this._size;
  }

  push(element: T): void {
    const oldBack = this._back;
    let newBack = oldBack;

    if (oldBack._elements.length === QUEUE_MAX_ARRAY_SIZE - 1) {
      newBack = {
        _elements: [],
        _next: undefined,
      };
      this._back = newBack;
      oldBack._next = newBack;
    }

    oldBack._elements.push(element);
    ++this._size;
  }

  shift(): T {
    const oldFront = this._front;
    let newFront = oldFront;
    const oldCursor = this._cursor;
    let newCursor = oldCursor + 1;

    const element = oldFront._elements[oldCursor];

    if (newCursor === QUEUE_MAX_ARRAY_SIZE) {
      newFront = oldFront._next!;
      newCursor = 0;
    }

    --this._size;
    this._cursor = newCursor;
    if (oldFront !== newFront) {
      this._front = newFront;
    }

    oldFront._elements[oldCursor] = undefined!;

    return element;
  }

  forEach(callback: (element: T) => void): void {
    let i = this._cursor;
    let node = this._front;
    let elements = node._elements;

    while (i !== elements.length || node._next !== undefined) {
      if (i === elements.length) {
        node = node._next!;
        elements = node._elements;
        i = 0;
        if (elements.length === 0) break;
      }
      callback(elements[i]);
      ++i;
    }
  }

  peek(): T {
    return this._front._elements[this._cursor];
  }
}

interface QueueContainer<T> {
  _queue: Queue<QueuePair<T>>;
  _queueTotalSize: number;
}

export interface QueuePair<T> {
  value: T;
  size: number;
}

export const dequeueValue = <T>(container: QueueContainer<T>): T => {
  assert(container._queue.length > 0, 'Queue is empty.');

  const pair = container._queue.shift() as QueuePair<T>;
  container._queueTotalSize = Math.max(
    0,
    container._queueTotalSize - pair.size,
  );

  return pair.value;
};

export const enqueueValueWithSize = <T>(
  container: QueueContainer<T>,
  value: T,
  size: number,
): void => {
  if (!isNonNegativeNumber(size) || !Number.isFinite(size)) {
    throw new RangeError(
      'Size must be a finite, non-NaN, non-negative number.',
    );
  }

  container._queue.push({ value, size } as QueuePair<T>);
  container._queueTotalSize += size;
};

export const peekQueueValue = <T>(container: QueueContainer<T>): T => {
  assert(container._queue.length > 0, 'Queue is empty.');

  const pair = container._queue.peek() as QueuePair<T>;
  return pair.value;
};

export const resetQueue = <T>(container: QueueContainer<T>): void => {
  container._queue = new Queue<QueuePair<T>>();
  container._queueTotalSize = 0;
};

export type QueuingStrategySizeCallback<T = any> = (chunk: T) => number;

export interface QueuingStrategyInit {
  highWaterMark: number;
}

export interface QueuingStrategy<T = any> {
  highWaterMark?: number;
  size?: QueuingStrategySizeCallback<T>;
}
