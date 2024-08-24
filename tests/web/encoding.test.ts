import { beforeAll, describe, expect, it } from '@std/test';

let encoder = new TextEncoder();

describe('TextDecoder', () => {
  it('should decode Latin-1 (Windows-1252) encoded bytes', () => {
    const decoder = new TextDecoder('windows-1252');
    const bytes = new Uint8Array([0xe4, 0xf6, 0xfc, 0xc4, 0xd6, 0xdc, 0xdf]);
    const decodedString = decoder.decode(bytes);
    expect(decodedString).toBe('äöüÄÖÜß');
  });

  it('should decode UTF-8 encoded bytes', () => {
    const decoder = new TextDecoder('utf-8');
    const bytes = new Uint8Array([0xe2, 0x82, 0xac]);
    const decodedString = decoder.decode(bytes);
    expect(decodedString).toBe('€');
  });

  it('should handle empty byte arrays', () => {
    const decoder = new TextDecoder('utf-8');
    const bytes = new Uint8Array([]);
    const decodedString = decoder.decode(bytes);
    expect(decodedString).toBe('');
  });

  it('should throw an error for invalid sequences when using fatal mode', () => {
    const decoder = new TextDecoder('utf-8', { fatal: true });
    const invalidBytes = new Uint8Array([0xff]);

    expect(() => {
      decoder.decode(invalidBytes);
    }).toThrow();
  });

  it('should ignore BOM when decode with ignoreBOM option', () => {
    const decoder = new TextDecoder('utf-8', { ignoreBOM: true });
    const bytes = new Uint8Array([0xef, 0xbb, 0xbf, 0xe2, 0x82, 0xac]);
    const decodedString = decoder.decode(bytes);
    expect(decodedString).toBe('€');
  });

  it('should not ignore BOM when decode without ignoreBOM option', () => {
    const decoder = new TextDecoder('utf-8');
    const bytes = new Uint8Array([0xef, 0xbb, 0xbf, 0xe2, 0x82, 0xac]);
    const decodedString = decoder.decode(bytes);
    expect(decodedString).toBe('\uFEFF€'); // BOM character included
  });

  it('should throw an error for incomplete UTF-16LE sequences when using fatal mode', () => {
    const decoder = new TextDecoder('utf-16le', { fatal: true });
    const incompleteBytes = new Uint8Array([0x61, 0x00, 0x62]);

    expect(() => {
      decoder.decode(incompleteBytes);
    }).toThrow();
  });

  it('should decode UTF-16LE bytes with ignoreBOM option', () => {
    const decoder = new TextDecoder('utf-16le', { ignoreBOM: true });
    const bytes = new Uint8Array([0xff, 0xfe, 0x61, 0x00, 0x62, 0x00]);
    const decodedString = decoder.decode(bytes);
    expect(decodedString).toBe('ab');
  });

  it('should decode UTF-16LE bytes without ignoreBOM option', () => {
    const decoder = new TextDecoder('utf-16le');
    const bytes = new Uint8Array([0xff, 0xfe, 0x61, 0x00, 0x62, 0x00]);
    const decodedString = decoder.decode(bytes);
    expect(decodedString).toBe('\uFEFFab'); // BOM character included
  });
});

describe('TextEncoder', () => {
  it('should encode a string to UTF-8', () => {
    const encoder = new TextEncoder();
    const string = 'Hello, World!';
    const encodedBytes = encoder.encode(string);
    expect(encodedBytes).toBeInstanceOf(Uint8Array);
    expect(encodedBytes).toHaveLength(13);
  });

  it('should encode an empty string to an empty byte array', () => {
    const encoder = new TextEncoder();
    const string = '';
    const encodedBytes = encoder.encode(string);
    expect(encodedBytes).toBeInstanceOf(Uint8Array);
    expect(encodedBytes).toHaveLength(0);
  });

  // TODO: not every example is working with encodeInto
  it('should encode into a specified buffer', () => {
    const fixture = 'text';
    const encoder = new TextEncoder();
    const bytes = new Uint8Array(5);
    const result = encoder.encodeInto(fixture, bytes);

    expect(result.read).toBe(4);
    expect(result.written).toBe(4);

    const fixture2 = '𝓽𝓮𝔁𝓽';
    const bytes2 = new Uint8Array(17);
    const result2 = encoder.encodeInto(fixture2, bytes2);
    expect(result2.read).toBe(8);
    expect(result2.written).toBe(16);
  });
});
