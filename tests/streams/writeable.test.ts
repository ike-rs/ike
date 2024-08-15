import { describe, expect, it } from '@std/test';

describe('WritableStream', () => {
  it('should create a WritableStream instance', () => {
    const stream = new WritableStream();
    expect(stream).toBeInstanceOf(WritableStream);
  });

  it('should write data to the stream', async () => {
    const data = ['chunk1', 'chunk2', 'chunk3'];
    const writtenData: any[] = [];

    const stream = new WritableStream({
      write(chunk) {
        writtenData.push(chunk);
      },
    });

    const writer = stream.getWriter();
    for (const chunk of data) {
      await writer.write(chunk);
    }
    await writer.close();

    console.log(writtenData, data);
    expect(writtenData).toBe(data);
  });

  it('should handle abort in the stream', async () => {
    const stream = new WritableStream({
      write(chunk, controller) {
        if (chunk === 'error') {
          controller.error(new Error('Write error'));
        }
      },
      abort(reason) {
        expect(reason).toBe('Test abort');
      },
    });

    const writer = stream.getWriter();
    await writer.abort('Test abort');
  });
});
