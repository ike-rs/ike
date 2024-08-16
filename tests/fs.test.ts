import { afterAll, beforeAll, describe, expect, it } from '@std/test';

describe('readFileSync', () => {
  // Might fail
  it('should correctly read the file', () => {
    // only if cwd is the root of the project
    const content = Ike.readFileSync('tests/hello.txt');
    expect(new TextDecoder().decode(content)).toBe('hello');
  });

  it('returned value should be an array of bytes', () => {
    const content = Ike.readFileSync('tests/hello.txt');
    expect(content).toBeInstanceOf(Uint8Array);
  });

  it('should throw an error if file does not exist', () => {
    expect(() => Ike.readFileSync('tests/non-existent-file.txt')).toThrow();
  });

  it('throw if no path is provided', () => {
    // @ts-ignore
    expect(() => Ike.readFileSync()).toThrow();
  });
});

describe('readFile', () => {
  it('should correctly read the file', async () => {
    const content = await Ike.readFile('tests/hello.txt');
    expect(new TextDecoder().decode(content)).toBe('hello');
  });

  it('returned value should be an array of bytes', async () => {
    const content = await Ike.readFile('tests/hello.txt');
    expect(content).toBeInstanceOf(Uint8Array);
  });

  it('should throw an error if file does not exist', async () => {
    expect(
      async () => await Ike.readFile('tests/non-existent-file.txt'),
    ).toThrow();
  });

  it('throw if no path is provided', async () => {
    // @ts-ignore
    await expect(Ike.readFile()).rejects.toThrow();
  });
});

describe('readTextFileSync', () => {
  it('should correctly read the file', () => {
    const content = Ike.readTextFileSync('tests/hello.txt');
    expect(content).toBe('hello');
  });

  it('returned value should be a string', () => {
    const content = Ike.readTextFileSync('tests/hello.txt');
    expect(content).toBeString();
  });

  it('should throw an error if file does not exist', () => {
    expect(() => Ike.readTextFileSync('tests/non-existent-file.txt')).toThrow();
  });

  it('throw if no path is provided', () => {
    // @ts-ignore
    expect(() => Ike.readTextFileSync()).toThrow();
  });
});

describe('readTextFile', () => {
  it('should correctly read the file', async () => {
    const content = await Ike.readTextFile('tests/hello.txt');
    expect(content).toBe('hello');
  });

  it('returned value should be a string', async () => {
    const content = await Ike.readTextFile('tests/hello.txt');
    expect(content).toBeString();
  });

  it('should throw an error if file does not exist', async () => {
    await expect(Ike.readTextFile('tests/non-existent-file.txt')).toThrow();
  });

  it('throw if no path is provided', async () => {
    // @ts-ignore
    await expect(Ike.readTextFile()).rejects.toThrow();
  });
});

describe('createDirSync', () => {
  afterAll(() => {
    try {
      Ike.removeDirSync('tests/new-dir');
      Ike.removeDirSync('tests/new-dir-2');
    } catch (err) {
      console.error('Failed to clean up directories', err);
    }
  });

  it('should create a new directory', () => {
    Ike.createDirSync('tests/new-dir');
    expect(Ike.existsSync('tests/new-dir')).toBe(true);
  });

  it('should create a new directory recursively', () => {
    Ike.createDirSync('tests/new-dir-2', { recursive: true });
    expect(Ike.existsSync('tests/new-dir-2')).toBe(true);
  });

  it('should throw an error if directory already exists', () => {
    expect(() => Ike.createDirSync('tests/new-dir')).toThrow();
  });

  it('throw if no path is provided', () => {
    // @ts-ignore
    expect(() => Ike.createDirSync()).toThrow();
  });
});

describe('existsSync', () => {
  it('should return true if file exists', () => {
    expect(Ike.existsSync('tests/hello.txt')).toBe(true);
  });

  it('should return false if file does not exist', () => {
    expect(Ike.existsSync('tests/non-existent-file.txt')).toBe(false);
  });

  it('should return true if directory exists', () => {
    expect(Ike.existsSync('tests')).toBe(true);
  });

  it('should return false if directory does not exist', () => {
    expect(Ike.existsSync('tests/non-existent-dir')).toBe(false);
  });
});

describe('createFileSync', () => {
  it('should create a new file', () => {
    Ike.createFileSync('tests/new-file.txt');
    expect(Ike.existsSync('tests/new-file.txt')).toBe(true);
  });

  it.skip('should truncate when file already exists', () => {
    // TODO: finish this test when we implement writeFileSync
  });

  it('throw if no path is provided', () => {
    // @ts-ignore
    expect(() => Ike.createFileSync()).toThrow();
  });
});

describe('removeFileSync', () => {
  it('should remove a file', () => {
    Ike.removeFileSync('tests/new-file.txt');
    expect(Ike.existsSync('tests/new-file.txt')).toBe(false);
  });

  it('should throw an error if file does not exist', () => {
    expect(() => Ike.removeFileSync('tests/non-existent-file.txt')).toThrow();
  });

  it('throw if no path is provided', () => {
    // @ts-ignore
    expect(() => Ike.removeFileSync()).toThrow();
  });
});
