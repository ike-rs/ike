import { assertEquals } from '@std/assert';

const fixture = '𝓽𝓮𝔁𝓽';
const encoder = new TextEncoder();
const bytes = new Uint8Array(5);
const result = encoder.encodeInto(fixture, bytes);
assertEquals(result.read, 2, 'read should be 2');
assertEquals(result.written, 4, 'written should be 4');
