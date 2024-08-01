import {describe, expect, it} from "test";

describe("URL", () => {
    it("should construct without any errors", () => {
        expect(() => {
            new URL("http://localhost:8080")
        }).notToThrow()
    })

    it("constructor should throw an error when the URL is invalid", () => {
        expect(() => {
            new URL("http://[:::1]")
        }).toThrow()
    })

    it("should return the hostname", () => {
        const url = new URL("http://www.example.com")
        expect(url.hostname).toBe("www.example.com")
    })

    it("protocol should end with a colon", () => {
        const url = new URL("http://www.example.com")
        expect(url.protocol.endsWith(":")).toBe(true)
    })

    it("should return the origin", () => {
        const url = new URL("http://www.example.com")
        expect(url.origin).toBe("http://www.example.com")
    })

    it("should return the host", () => {
        const url = new URL("http://www.example.com")
        expect(url.host).toBe("www.example.com")
    })

    it("should return the port", () => {
        const url = new URL("http://www.example.com:8080")
        expect(url.port).toBe("8080")
    })

    it("should return the pathname", () => {
        const url = new URL("http://www.example.com/path/to/resource")
        expect(url.pathname).toBe("/path/to/resource")
    })

    it("should return the search", () => {
        const url = new URL("http://www.example.com?query=string")
        expect(url.search).toBe("?query=string")
    })

    it("should correctly stringify the URL", () => {
        const url = new URL("http://www.example.com")
        expect(`URL: ${url}`).toBe("URL: http://www.example.com")
    })

    it("URL.parse should return the correct URL object", () => {
        const url = URL.parse("http://www.example.com?query=string")
        expect(url.hostname).toBe("www.example.com")
        expect(url.search).toBe("?query=string")
    })

    it("URL.parse should return null when the URL is invalid", () => {
        const url = URL.parse("http://[:::1]")
        expect(url).toBe(null)
    })

    it("URL.canParse should return true for a valid URL", () => {
        expect(URL.canParse("http://www.example.com")).toBe(true)
    })

    it("URL.canParse should return false for an invalid URL", () => {
        expect(URL.canParse("http://[:::1]")).toBe(false)
    })
})