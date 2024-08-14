import type {
  ReadableStreamAsyncIterator,
  ReadableStreamIteratorOptions,
} from '../../../../../packages/types/src/modules/streams';
import { SymbolAsyncIterator } from './ecmascript';

export class ReadableStream<R = any> implements AsyncIterable<R> {
  constructor() {
    console.log('ReadableStream constructor');
  }

  static from<T>(asyncIterator: AsyncIterable<T>): ReadableStream<T> {
    console.log('ReadableStream.from');
    return new ReadableStream();
  }

  [Symbol.asyncIterator](
    options?: ReadableStreamIteratorOptions,
  ): ReadableStreamAsyncIterator<R>;

  [SymbolAsyncIterator](
    options?: ReadableStreamIteratorOptions,
  ): ReadableStreamAsyncIterator<R> {
    return {};
  }

  async next() {
    console.log('ReadableStream.next');
    return { done: true, value: null };
  }
}
