import { describe, expect, it } from '@std/test';

describe('Headers', () => {
  it('expect Headers to be defined', () => {
    expect(Headers).notToBeUndefined();
  });

  it('should create a new Headers object', () => {
    expect(
      () =>
        new Headers([
          ['Content-Type', 'application/json'],
          ['Content-Type', 'application/txt'],
          ['Set-Cookie', 'name=value'],
          ['Set-Cookie', 'name2=value2'],
        ]),
    ).notToThrow();
  });

  it('should throw when provided with invalid headers', () => {
    expect(
      () =>
        new Headers([
          ['Content-Type', 'application/json'],
          ['Content-Type', 'application/txt'],
          ['Set-Cookie', 'name=value'],
          ['Set-Cookie', 'name2=value2'],
          ['Invalid-Header', 'value'],
        ]),
    ).toThrow();
  });

  it('should append a new value to an existing header', () => {
    const headers = new Headers([
      ['Content-Type', 'application/json'],
      ['Content-Type', 'application/txt'],
      ['Set-Cookie', 'name=value'],
      ['Set-Cookie', 'name2=value2'],
    ]);
    headers.append('Content-Type', 'application/xml');
    expect(headers.get('Content-Type')).toBe(
      'application/json, application/txt, application/xml',
    );
  });

  it('should handle case-insensitive header names correctly', () => {
    const headers = new Headers([['Content-Type', 'application/json']]);
    expect(headers.has('content-type')).toBe(true);
    expect(headers.get('CONTENT-TYPE')).toBe('application/json');
  });

  it("should return string when getting 'set-cookie' header using get", () => {
    const headers = new Headers([
      ['Content-Type', 'application/json'],
      ['Content-Type', 'application/txt'],
      ['Set-Cookie', 'name=value'],
      ['Set-Cookie', 'name2=value2'],
    ]);
    expect(headers.get('Set-Cookie')).toBe('name=value, name2=value2');
  });

  it("should return an array when getting the 'set-cookie' header using getSetCookie", () => {
    const headers = new Headers([
      ['Content-Type', 'application/json'],
      ['Content-Type', 'application/txt'],
      ['Set-Cookie', 'name=value'],
      ['Set-Cookie', 'name2=value2'],
    ]);
    expect(headers.getSetCookie()).toBe(['name=value', 'name2=value2']);
  });

  it('should delete a header', () => {
    const headers = new Headers([
      ['Content-Type', 'application/json'],
      ['Content-Type', 'application/txt'],
      ['Set-Cookie', 'name=value'],
      ['Set-Cookie', 'name2=value2'],
    ]);
    headers.delete('Content-Type');
    expect(headers.get('Content-Type')).toBeUndefined();
  });

  it('should maintain other headers after deletion', () => {
    const headers = new Headers([
      ['Content-Type', 'application/json'],
      ['Set-Cookie', 'name=value'],
    ]);
    headers.delete('Content-Type');
    expect(headers.has('Content-Type')).toBe(false);
    expect(headers.get('Set-Cookie')).toBe('name=value');
  });

  it('should return true if header exists', () => {
    const headers = new Headers([
      ['Content-Type', 'application/json'],
      ['Content-Type', 'application/txt'],
      ['Set-Cookie', 'name=value'],
      ['Set-Cookie', 'name2=value2'],
    ]);
    expect(headers.has('Content-Type')).toBe(true);
  });

  it('should return false if header does not exist', () => {
    const headers = new Headers([
      ['Content-Type', 'application/json'],
      ['Content-Type', 'application/txt'],
      ['Set-Cookie', 'name=value'],
      ['Set-Cookie', 'name2=value2'],
    ]);
    expect(headers.has('Invalid-Header')).toBe(false);
  });

  it('should set a new value for the specified header', () => {
    const headers = new Headers([
      ['Content-Type', 'application/json'],
      ['Content-Type', 'application/txt'],
      ['Set-Cookie', 'name=value'],
      ['Set-Cookie', 'name2=value2'],
    ]);
    headers.set('Content-Type', 'application/xml');
    expect(headers.get('Content-Type')).toBe('application/xml');
  });

  it('should throw when setting an invalid header', () => {
    const headers = new Headers([
      ['Content-Type', 'application/json'],
      ['Content-Type', 'application/txt'],
      ['Set-Cookie', 'name=value'],
      ['Set-Cookie', 'name2=value2'],
    ]);
    expect(() => headers.set('Invalid-Header', 'value')).toThrow();
  });

  it('should throw when appending an invalid header', () => {
    const headers = new Headers([
      ['Content-Type', 'application/json'],
      ['Content-Type', 'application/txt'],
      ['Set-Cookie', 'name=value'],
      ['Set-Cookie', 'name2=value2'],
    ]);
    expect(() => headers.append('Invalid-Header', 'value')).toThrow();
  });
});
