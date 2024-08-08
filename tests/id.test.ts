import { describe, expect, it } from 'test';

describe('Ike.{uid,gid,pid}', () => {
  it('expect pid to be a number', () => {
    expect(Ike.pid).toBeNumber();
  });

  it.if(Ike.isWindows(), 'expect uid to be null on Windows', () => {
    expect(Ike.uid()).toBeNull();
  });

  it.if(Ike.isWindows(), 'expect gid to be null on Windows', () => {
    expect(Ike.gid()).toBeNull();
  });

  it.if(!Ike.isWindows(), 'expect uid to be a number on Unix platforms', () => {
    expect(Ike.uid()).toBeNumber();
  });

  it.if(!Ike.isWindows(), 'expect gid to be a number on Unix platforms', () => {
    expect(Ike.gid()).toBeNumber();
  });

  it("expect env to be defined", () => {
    expect(Ike.env).notToBeUndefined()
  })
});
