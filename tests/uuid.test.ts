import { describe, it, expect } from '@std/test';
import { parse } from '@std/uuid';

describe('@std/uuid > parse', () => {
  it('should parse a valid UUID', () => {
    expect(() => parse('550e8400-e29b-41d4-a716-446655440000')).notToThrow();
  });

  it('should throw an error if UUID is invalid', () => {
    expect(() => parse('550e8400-e29b-41d4-a716-44665544000')).toThrow();
  });
});
