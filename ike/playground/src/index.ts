import { isAscii, btoa } from "buffer";

console.log(
  isAscii(
    new Uint8Array([
      0x48, 0x65, 0x6c, 0x6c, 0x6f, 0x20, 0x57, 0x6f, 0x72, 0x6c, 0x64,
    ])
  )
); // true

console.log(btoa("Hello World!")); // SGVsbG8gV29ybGQh
