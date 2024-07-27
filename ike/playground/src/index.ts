import { isAscii } from "buffer";

console.log(isAscii(new TextEncoder().encode("dwa")));
