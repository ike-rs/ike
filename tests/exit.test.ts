import { describe, expect, it } from "test";

describe("Ike.exit", () => {
  it("expect default exit code to be 0", () => {
    expect(Ike.exitCode).toBe(0);
  });

  it("expect to throw an error if the code is not a number", () => {
    // @ts-expect-error
    expect(() => Ike.setExitCode("3")).toThrow();
  });

  it("expect to throw an error if no arguments are provided", () => {
    // @ts-expect-error
    expect(() => Ike.setExitCode()).toThrow();
  });

  it("expect to set the exit code to 3", () => {
    Ike.setExitCode(3);
    expect(Ike.exitCode).toBe(3);
  });
});
