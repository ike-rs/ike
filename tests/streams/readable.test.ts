import { describe, expect, it } from '@std/test';

class FakeAbortSignal {
  aborted: any;

  constructor(aborted: any) {
    this.aborted = aborted;
  }

  addEventListener(type: any, listener: any) {
    return;
  }

  removeEventListener(type: any, listener: any) {
    return;
  }
}

describe('ReadableStream', () => {
  it('should create a ReadableStream instance', () => {
    const stream = new ReadableStream();
    expect(stream).toBeInstanceOf(ReadableStream);
  });

  it('should read data from the stream', async () => {
    const data = ['chunk1', 'chunk2', 'chunk3'];
    const stream = new ReadableStream({
      start(controller) {
        data.forEach((chunk) => controller.enqueue(chunk));
        controller.close();
      },
    });

    const reader = stream.getReader();
    const result = [];

    let done, value;
    while ((({ done, value } = await reader.read()), !done)) {
      result.push(value);
    }

    expect(result).toBe(data);
  });

  it('should handle errors in the stream', async () => {
    const error = new Error('Test error');
    const stream = new ReadableStream({
      start(controller) {
        controller.error(error);
      },
    });

    const reader = stream.getReader();

    await expect(reader.read()).toThrow();
  });

  it('supports a ReadableStream-like object', async () => {
    let i = 0;
    const closedPromise = new Promise(() => {});
    const readerLike = {
      get closed() {
        return closedPromise;
      },
      async read() {
        return { done: false, value: ++i };
      },
      async cancel() {},
      releaseLock() {},
    };
    const streamLike = {
      getReader() {
        return readerLike;
      },
    };
    // ? I don't why types from dom.d.ts are getting detected
    const wrapped = ReadableStream.from(streamLike);
    expect(wrapped).toBeInstanceOf(ReadableStream);
    const reader = wrapped.getReader();
    await expect(reader.read()).toBe({ done: false, value: 1 });
    await expect(reader.read()).toBe({ done: false, value: 2 });
  });

  it('reads chunks from underlying source', async () => {
    const rs = new ReadableStream({
      start(c) {
        c.enqueue('a');
        c.enqueue('b');
        c.close();
      },
    });
    const reader = rs.getReader();
    expect(await reader.read()).toBe({ done: false, value: 'a' });
    expect(await reader.read()).toBe({ done: false, value: 'b' });
    expect(await reader.read()).toBe({ done: true, value: undefined });
  });

  it('pipeTo \\> accepts an abort signal', async () => {
    const rs = new ReadableStream({
      start(c) {
        c.enqueue('a');
        c.close();
      },
    });
    const ws = new WritableStream();
    const signal = new FakeAbortSignal(false);
    // @ts-ignore
    await rs.pipeTo(ws, { signal });
  });

  it('pipeTo \\> rejects with an AbortError when aborted', async () => {
    const rs = new ReadableStream({
      start(c) {
        c.enqueue('a');
        c.close();
      },
    });
    const ws = new WritableStream();
    const signal = new FakeAbortSignal(true);
    try {
      // @ts-ignore
      expect(await rs.pipeTo(ws, { signal })).toThrow();
    } catch (e: any) {
      expect(e.name).toBe('AbortError');
    }
  });
});
