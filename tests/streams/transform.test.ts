import { describe, expect, it } from '@std/test';

describe('TransformStream', () => {
  it('should create a TransformStream instance', () => {
    const stream = new TransformStream();
    expect(stream).toBeInstanceOf(TransformStream);
  });

  it('should transform data', async () => {
    const stream = new TransformStream({
      transform(chunk, controller) {
        controller.enqueue(chunk.toUpperCase());
      },
    });

    const reader = stream.readable.getReader();
    const writer = stream.writable.getWriter();

    await writer.write('hello');
    await writer.close();

    const { value, done } = await reader.read();
    expect(value).toBe('HELLO');
    expect(done).toBe(false);

    const { done: done2 } = await reader.read();
    expect(done2).toBe(true);
  });

  it('should handle errors in the transform stream', async () => {
    const stream = new TransformStream({
      transform(chunk, controller) {
        if (chunk === 'error') {
          controller.error(new Error('Transform error'));
        } else {
          controller.enqueue(chunk);
        }
      },
    });

    const reader = stream.readable.getReader();
    const writer = stream.writable.getWriter();

    await writer.write('ok');
    await expect(writer.write('error')).toThrow();
    await writer.close();

    const { value, done } = await reader.read();
    expect(value).toBe('ok');
    expect(done).toBe(false);
  });
});
