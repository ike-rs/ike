import { describe, expect, it } from '@std/test';

describe('Headers', () => {
  it('expect Headers to be defined', () => {
    expect(Headers).notToBeUndefined();
  });

  it('should allow creating empty headers', () => {
    const headers = new Headers();
    expect(headers).toBeInstanceOf(Headers);
  });

  it('should allow creating headers from an object', () => {
    const headers = new Headers({ 'Content-Type': 'application/json' });
    expect(headers.get('Content-Type')).toBe('application/json');
  });

  it('should allow creating headers from an array of tuples', () => {
    const headers = new Headers([['Content-Type', 'application/json']]);
    expect(headers.get('Content-Type')).toBe('application/json');
  });

  it('should normalize header names to lowercase', () => {
    const headers = new Headers({ 'X-Custom-Header': 'value' });
    expect(headers.get('x-custom-header')).toBe('value');
  });

  it('should return null for non-existent headers', () => {
    const headers = new Headers();
    expect(headers.get('X-Non-Existent')).toBeNull();
  });

  it('should set a new header or overwrite an existing one', () => {
    const headers = new Headers();
    headers.set('Content-Type', 'text/plain');
    expect(headers.get('Content-Type')).toBe('text/plain');

    headers.set('Content-Type', 'application/json');
    expect(headers.get('Content-Type')).toBe('application/json');
  });

  it('should append a value to an existing header', () => {
    const headers = new Headers();
    headers.append('X-Custom-Header', 'value1');
    headers.append('X-Custom-Header', 'value2');
    expect(headers.get('X-Custom-Header')).toBe('value1, value2');
  });

  it('should delete a header', () => {
    const headers = new Headers({ 'X-Custom-Header': 'value' });
    headers.delete('X-Custom-Header');
    expect(headers.get('X-Custom-Header')).toBeNull();
  });

  it('should check if a header exists', () => {
    const headers = new Headers({ 'Content-Type': 'application/json' });
    expect(headers.has('Content-Type')).toBe(true);
    expect(headers.has('Accept')).toBe(false);
  });

  it('should allow iterating over all headers', () => {
    const headers = new Headers({
      'Content-Type': 'application/json',
      Accept: 'application/json',
    });
    const entries = Array.from(headers.entries());

    expect(entries).toBe([
      ['accept', 'application/json'],
      ['content-type', 'application/json'],
    ]);
  });

  it('should return an iterator of all header entries with entries()', () => {
    const headers = new Headers({
      'Content-Type': 'application/json',
      Accept: 'text/html',
    });
    const entries = headers.entries();
    const result = Array.from(entries);

    expect(result).toBe([
      ['accept', 'text/html'],
      ['content-type', 'application/json'],
    ]);
  });

  it('should return an iterator of all header keys with keys()', () => {
    const headers = new Headers({
      'Content-Type': 'application/json',
      Accept: 'text/html',
    });
    const keys = headers.keys();
    const result = Array.from(keys);

    expect(result).toBe(['accept', 'content-type']);
  });

  it('should return an iterator of all header values with values()', () => {
    const headers = new Headers({
      'Content-Type': 'application/json',
      Accept: 'text/html',
    });
    const values = headers.values();
    const result = Array.from(values);

    expect(result).toBe(['text/html', 'application/json']);
  });
});
