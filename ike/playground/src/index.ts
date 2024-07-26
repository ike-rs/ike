import { assert } from "assert";

assert(
  new TextEncoder().encodeInto("Hello, world! 🌍", new Uint8Array([0, 20])),
  {
    read: 2,
    written: 2,
  },
  "TextEncoder.encodeInto() failed"
);

assert(new Map().set("key", "value").get("key"), "value", "Map failed");

assert(
  {
    a: {
      b: {
        c: 1,
      },
    },
  }.a.b.c,
  1,
  "Object failed"
);
