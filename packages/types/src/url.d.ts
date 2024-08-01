declare global {

    /**
     * The URL interface is used to parse, construct, normalize, and encode URLs.
     * It works by providing properties which allow you to easily read and modify the components of a URL.
     *
     * @example
     * const url = new URL("http://www.example.com");
     * console.log(url.hostname); // "www.example.com"
     */
    export class URL {
        /**
         * Creates and returns a URL object from a URL string and optional base URL string.
         * Throws if the passed arguments don't define a valid URL.
         *
         * @param url - The URL string.
         * @param base - An optional base URL string.
         */
        constructor(url: string, base?: string);

        /** A string containing a '#' followed by the fragment identifier of the URL. */
        hash: string;

        /** A string containing the domain followed by (if a port was specified) a ':' and the port of the URL. */
        host: string;

        /** A string containing the domain of the URL. */
        hostname: string;

        /** A string containing the whole URL. */
        href: string;

        /** Readonly. Returns a string containing the origin of the URL, including its scheme, domain, and port. */
        readonly origin: string;

        /** A string containing the password specified before the domain name. */
        password: string;

        /** A string containing an initial '/' followed by the path of the URL, not including the query string or fragment. */
        pathname: string;

        /** A string containing the port number of the URL. */
        port: string;

        /** A string containing the protocol scheme of the URL, including the final ':'. */
        protocol: string;

        /** A string containing the URL's parameter string, including the leading '?' character. */
        search: string;

        /** Readonly. A URLSearchParams object which can be used to access the individual query parameters found in the search string. */
        readonly searchParams: URLSearchParams;

        /** A string containing the username specified before the domain name. */
        username: string;

        /**
         * Returns a boolean indicating whether a URL defined from a URL string and optional base URL string is parsable and valid.
         *
         * @param url - The URL string to parse.
         * @param base - An optional base URL string.
         */
        static canParse(url: string, base?: string): boolean;

        /**
         * Returns a string containing a unique blob URL, that is a URL with blob: as its scheme, followed by an opaque string uniquely identifying the object in the browser.
         *
         * @param obj - The object for which to create the blob URL.
         */
        static createObjectURL(obj: any): string;

        /**
         * Creates and returns a URL object from a URL string and optional base URL string, or returns null if the passed parameters define an invalid URL.
         *
         * @param url - The URL string to parse.
         * @param base - An optional base URL string.
         */
        static parse(url: string, base?: string): URL | null;

        /**
         * Revokes an object URL previously created using URL.createObjectURL().
         *
         * @param url - The blob URL to revoke.
         */
        static revokeObjectURL(url: string): void;

        /**
         * Returns a string containing the whole URL.
         * It is a synonym for URL.href, though it can't be used to modify the value.
         */
        toString(): string;

        /**
         * Returns a string containing the whole URL.
         * It returns the same string as the href property.
         */
        toJSON(): string;
    }
}
