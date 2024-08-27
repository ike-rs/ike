import {
  isDataView,
  isSharedArrayBuffer,
  isTypedArray,
  toString,
} from '@std/_internal_';
import { assertProto } from '@std/assert';

export class TextDecoder {
  #encoding;
  #fatal;
  #ignoreBOM;

  constructor(
    encoding = 'utf-8',
    opts = {
      fatal: false,
      ignoreBOM: false,
    },
  ) {
    this.#encoding = encoding;
    this.#fatal = opts.fatal;
    this.#ignoreBOM = opts.ignoreBOM;
  }

  get encoding() {
    assertProto(this, TextDecoder);
    return this.#encoding;
  }

  get fatal() {
    assertProto(this, TextDecoder);
    return this.#fatal;
  }

  get ignoreBOM() {
    assertProto(this, TextDecoder);
    return this.#ignoreBOM;
  }

  decode(
    input = new Uint8Array(),
    opts = {
      stream: false,
    },
  ) {
    assertProto(this, TextDecoder);

    let data = input;
    if (isTypedArray(data)) {
      data = data.buffer;
    } else if (isDataView(data)) {
      data = data.buffer;
    }

    if (isSharedArrayBuffer(data)) {
      input = new Uint8Array(data, input.byteOffset, input.byteLength);
    } else if (isDataView(data)) {
      input = new Uint8Array(data.buffer, data.byteOffset, data.byteLength);
    } else {
      input = new Uint8Array(data);
    }

    return decode_ex(this.#encoding, this.#fatal, this.#ignoreBOM, input, opts);
  }
}

export class TextEncoder {
  constructor() {}

  get encoding() {
    assertProto(this, TextEncoder);
    return 'utf-8';
  }

  encode(input = '') {
    assertProto(this, TextEncoder);
    let data = toString(input);
    return encode_ex(data);
  }

  encodeInto(input = '', output = new Uint8Array()) {
    assertProto(this, TextEncoder);
    let data = toString(input);
    return encode_into_ex(data, output);
  }
}
