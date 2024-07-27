import { isAscii } from "buffer";

setTimeout(() => {
  console.log(isAscii(new TextEncoder().encode("dwa")));
}, 1000);
