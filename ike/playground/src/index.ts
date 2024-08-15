const numberStream = new ReadableStream<number>({
  start(controller) {
    console.log('Stream started');
    this.currentNumber = 1;
  },
  async pull(controller) {
    if (this.currentNumber <= 10) {
      controller.enqueue(this.currentNumber);
      console.log(`Enqueued: ${this.currentNumber}`);
      this.currentNumber++;
      await new Promise((resolve) => setTimeout(resolve, 1000)); // 1 second delay
    } else {
      controller.close();
      console.log('Stream closed');
    }
  },
  cancel(reason) {
    console.log(`Stream cancelled: ${reason}`);
  },
});

const reader = numberStream.getReader();

async function readStream() {
  while (true) {
    const { done, value } = await reader.read();
    if (done) {
      console.log('Stream reading complete');
      break;
    }
    console.log(`Read value: ${value}`);
  }
}

readStream();
