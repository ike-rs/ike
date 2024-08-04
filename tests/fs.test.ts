import {describe, expect, it} from "test";

describe("readFileSync", () => {
    // Might fail
    it("should correctly read the file", () => {
        // only if cwd is the root of the project
        const content = Ike.readFileSync("tests/hello.txt");
        expect(new TextDecoder().decode(content)).toBe("hello");
    })

    it("returned value should be an array of bytes", () => {
        const content = Ike.readFileSync("tests/hello.txt");
        expect(content).toBeInstanceOf(Uint8Array);
    })

    it("should throw an error if file does not exist", () => {
        expect(() => Ike.readFileSync("tests/non-existent-file.txt")).toThrow();
    })

    it("throw if no path is provided", () => {
        // @ts-ignore
        expect(() => Ike.readFileSync()).toThrow();
    })
})

describe("readTextFileSync", () => {
    it("should correctly read the file", () => {
        const content = Ike.readTextFileSync("tests/hello.txt");
        expect(content).toBe("hello");
    })

    it("returned value should be a string", () => {
        const content = Ike.readTextFileSync("tests/hello.txt");
        expect(content).toBeString()
    })

    it("should throw an error if file does not exist", () => {
        expect(() => Ike.readTextFileSync("tests/non-existent-file.txt")).toThrow();
    })

    it("throw if no path is provided", () => {
        // @ts-ignore
        expect(() => Ike.readTextFileSync()).toThrow();
    })
})