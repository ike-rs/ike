import { beforeAll, describe, expect, it } from '@std/test';

describe('URL', () => {
  it('should construct without any errors', () => {
    expect(() => {
      new URL('http://localhost:8080');
    }).notToThrow();
  });

  it('constructor should throw an error when the URL is invalid', () => {
    expect(() => {
      new URL('http://[:::1]');
    }).toThrow();
  });

  it('should return the hostname', () => {
    const url = new URL('http://www.example.com');
    expect(url.hostname).toBe('www.example.com');
  });

  it('protocol should end with a colon', () => {
    const url = new URL('http://www.example.com');
    expect(url.protocol.endsWith(':')).toBe(true);
  });

  it('should return the origin', () => {
    const url = new URL('http://www.example.com');
    expect(url.origin).toBe('http://www.example.com');
  });

  it('should return the host', () => {
    const url = new URL('http://www.example.com');
    expect(url.host).toBe('www.example.com');
  });

  it('should return the port', () => {
    const url = new URL('http://www.example.com:8080');
    expect(url.port).toBe('8080');
  });

  it('should return the pathname', () => {
    const url = new URL('http://www.example.com/path/to/resource');
    expect(url.pathname).toBe('/path/to/resource');
  });

  it('should return the search', () => {
    const url = new URL('http://www.example.com?query=string');
    expect(url.search).toBe('?query=string');
  });

  it('should correctly stringify the URL', () => {
    const url = new URL('http://www.example.com');
    expect(`URL: ${url}`).toBe('URL: http://www.example.com');
  });

  it('URL.parse should return the correct URL object', () => {
    const url = URL.parse('http://www.example.com?query=string');
    expect(url?.hostname).toBe('www.example.com');
    expect(url?.search).toBe('?query=string');
  });

  it('URL.parse should return null when the URL is invalid', () => {
    const url = URL.parse('http://[:::1]');
    expect(url).toBe(null);
  });

  it('URL.canParse should return true for a valid URL', () => {
    expect(URL.canParse('http://www.example.com')).toBe(true);
  });

  it('URL.canParse should return false for an invalid URL', () => {
    expect(URL.canParse('http://[:::1]')).toBe(false);
  });
});

describe('URLSearchParams', () => {
  it('should initialize with empty params', () => {
    const params = new URLSearchParams('');
    expect(params.toString()).toBe('');
  });

  it('should append a new parameter', () => {
    const params = new URLSearchParams('');
    params.append('key', 'value');
    expect(params.toString()).toBe('key=value');
  });

  it('should delete a parameter', () => {
    const params = new URLSearchParams('key=value');
    params.delete('key');
    expect(params.toString()).toBe('');
  });

  it('should get a parameter value', () => {
    const params = new URLSearchParams('key=value');
    expect(params.get('key')).toBe('value');
  });

  it('should get all values of a parameter', () => {
    const params = new URLSearchParams('key=value1&key=value2');
    const values = params.getAll('key');
    expect(values).toBe(['value1', 'value2']);
  });

  it('should check if a parameter exists', () => {
    const params = new URLSearchParams('key=value');
    expect(params.has('key')).toBe(true);
    expect(params.has('nonexistent')).toBe(false);
  });

  it('should set a parameter value', () => {
    const params = new URLSearchParams('');
    params.set('key', 'value');
    expect(params.toString()).toBe('key=value');
  });

  it('should update an existing parameter value with set', () => {
    const params = new URLSearchParams('key=oldValue');
    params.set('key', 'newValue');
    expect(params.toString()).toBe('key=newValue');
  });

  it('should handle multiple parameter values', () => {
    const params = new URLSearchParams('');
    params.append('key', 'value1');
    params.append('key', 'value2');
    expect(params.toString()).toBe('key=value1&key=value2');
  });

  it('should handle delete specific value of a parameter with multiple values', () => {
    const params = new URLSearchParams('key=value1&key=value2');
    params.delete('key', 'value1');
    expect(params.toString()).toBe('key=value2');
  });

  it('should return null for non-existent parameter', () => {
    const params = new URLSearchParams('');
    expect(params.get('key')).toBe(null);
  });

  it('should return empty array for getAll on non-existent parameter', () => {
    const params = new URLSearchParams('');
    expect(params.getAll('key')).toBe([]);
  });

  it('should encode special characters', () => {
    const params = new URLSearchParams('value=hello world&key=hello+world');
    expect(params.toString()).toBe('value=hello%20world&key=hello%2Bworld');
    const params1 = new URLSearchParams('val=👾 Exterminate!');
    expect(params1.toString()).toBe('val=%F0%9F%91%BE%20Exterminate%21');
  });

  it('should decode special characters', () => {
    const params = new URLSearchParams('value=hello%20world&key=hello%2Bworld');
    expect(params.get('value')).toBe('hello world');
    expect(params.get('key')).toBe('hello+world');
  });
});
