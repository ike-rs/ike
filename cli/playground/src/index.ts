const async_gen = async function* () {
  yield 1;
  yield 2;
  yield 3;
};

const stream = new ReadableStream({
  async start(controller) {
    for await (const chunk of async_gen()) {
      controller.enqueue(chunk);
    }
    controller.close();
  },
});

const reader = stream.getReader();

while (true) {
  const { done, value } = await reader.read();
  if (done) {
    break;
  }
  console.log(value);
}
