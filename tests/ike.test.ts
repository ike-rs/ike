import { describe, expect, it } from 'test';

describe('Ike', () => {
  it('expect to be defined', () => {
    expect(Ike).toBeDefined();
  });

  it('expect Ike.os to return correct value', () => {
    if (Ike.isLinux()) {
      expect(Ike.os).toBe('linux');
    } else if (Ike.isMacOS()) {
      expect(Ike.os).toBe('macos');
    } else if (Ike.isWindows()) {
      expect(Ike.os).toBe('windows');
    } else {
      expect(Ike.os).toBeString();
    }
  });

  it('expect Ike.version to be defined', () => {
    expect(Ike.version).toBeDefined();
  });

  it('expect cwd to be defined', () => {
    expect(Ike.cwd).toBeDefined();
  });

  it('expect env to be defined', () => {
    expect(Ike.env).toBeDefined();
  });
});
