import { describe, it, expect } from "test";
import { isAscii, isUtf8 } from "buffer";

let encoder = new TextEncoder();

describe("Base64 encoding and decoding", () => {
  it("should encode a string to base64 using btoa", () => {
    const originalString = "Hello, World!";
    const base64String = btoa(originalString);
    expect(base64String).toBe("SGVsbG8sIFdvcmxkIQ==");
  });

  it("should decode a base64 string to original string using atob", () => {
    const base64String = "SGVsbG8sIFdvcmxkIQ==";
    const decodedString = atob(base64String);
    expect(decodedString).toBe("Hello, World!");
  });

  it("should handle empty strings", () => {
    const originalString = "";
    const base64String = btoa(originalString);
    expect(base64String).toBe("");

    const decodedString = atob(base64String);
    expect(decodedString).toBe(originalString);
  });

  it("should throw an error for non-base64 strings in atob", () => {
    expect(() => {
      atob("not_base64");
    }).toThrow();
  });
});

// Add TextDecoder tests when implemented
describe("TextEncoder and TextDecoder", () => {
  it("should encode a string to UTF-8 using TextEncoder", () => {
    const originalString = "Hello, World!";
    const encoder = new TextEncoder();
    const utf8Array = encoder.encode(originalString);
    expect(utf8Array).toBe(
      new Uint8Array([
        72, 101, 108, 108, 111, 44, 32, 87, 111, 114, 108, 100, 33,
      ])
    );
  });
});

describe("isAscii", () => {
  it("should return true for ASCII strings", () => {
    const arr = encoder.encode("Hello, World!");
    expect(isAscii(arr)).toBe(true);
  });

  it("should return false for non-ASCII strings", () => {
    const arr = encoder.encode("你好，世界！");
    expect(isAscii(arr)).toBe(false);
  });

  it("should throw if the input is not a TypedArray or ArrayBuffer", () => {
    // @ts-ignore
    expect(() => isAscii("Hello, World!")).toThrow();
  });
});

describe("isUtf8", () => {
  it("should return true for valid UTF-8 strings", () => {
    const arr = encoder.encode("Hello, World!");
    expect(isUtf8(arr)).toBe(true);
  });

  it("should return false for invalid UTF-8 strings", () => {
    const arr = new Uint8Array([0xff]);
    expect(isUtf8(arr)).toBe(false);
  });

  it("should throw if the input is not a TypedArray or ArrayBuffer", () => {
    // @ts-ignore
    expect(() => isUtf8("Hello, World!")).toThrow();
  });
});

describe("TextDecoder", () => {
  it("should decode Latin-1 (Windows-1252) encoded bytes", () => {
    const decoder = new TextDecoder("windows-1252");
    const bytes = new Uint8Array([0xe4, 0xf6, 0xfc, 0xc4, 0xd6, 0xdc, 0xdf]);
    const decodedString = decoder.decode(bytes);
    expect(decodedString).toBe("äöüÄÖÜß");
  });

  it("should decode UTF-8 encoded bytes", () => {
    const decoder = new TextDecoder("utf-8");
    const bytes = new Uint8Array([0xe2, 0x82, 0xac]);
    const decodedString = decoder.decode(bytes);
    expect(decodedString).toBe("€");
  });

  // Expect to fail, because TextDecoder doesn't implement all the options
  it("should handle incomplete UTF-8 sequences when streaming", () => {
    const decoder = new TextDecoder("utf-8", { fatal: true });
    const bytes1 = new Uint8Array([0xe2]);
    const bytes2 = new Uint8Array([0x82, 0xac]);

    const partialDecodedString = decoder.decode(bytes1, { stream: true });
    expect(partialDecodedString).toBe("");

    const completeDecodedString = decoder.decode(bytes2, { stream: false });
    expect(completeDecodedString).toBe("€");
  });

  it("should handle empty byte arrays", () => {
    const decoder = new TextDecoder("utf-8");
    const bytes = new Uint8Array([]);
    const decodedString = decoder.decode(bytes);
    expect(decodedString).toBe("");
  });

  it("should throw an error for invalid sequences when using fatal mode", () => {
    const decoder = new TextDecoder("utf-8", { fatal: true });
    const invalidBytes = new Uint8Array([0xff]);

    expect(() => {
      decoder.decode(invalidBytes);
    }).toThrow();
  });
});
