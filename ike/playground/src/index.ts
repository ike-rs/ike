const x = new TextDecoder("utf-8", {
  ignoreBOM: true,
});

// x.decode(new Uint8Array([104, 101, 108, 108, 111]));

x.decode(new Uint8Array([104, 101, 108, 108, 111]));
