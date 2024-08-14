import { ReadableStream } from '@std/streams';

import { isFunction } from './test';

// const asyncIterator = (async function* () {
//   yield 1;
//   yield 2;
//   yield 3;
// })();

// const myReadableStream = ReadableStream.from(asyncIterator);
// console.log(myReadableStream);

// for await (const chunk of myReadableStream) {
//   console.log(chunk);
// }

console.log(isFunction(() => {}));

const stream = new ReadableStream();
