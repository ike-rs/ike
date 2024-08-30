import { getArgument, toString } from "@std/_internal_";
import { assertProto } from "@std/assert";
import { addWebIterators } from "module:web/main.js";

const _searchParams = Symbol("searchParams");
const _url = Symbol("url");
const _updateUrl = Symbol("updateUrl");

class URLSearchParams {
    [_searchParams];
    [_url];

    constructor(init = "") {
        if (!init) {
            this[_searchParams] = [];
            return;
        }

        if (typeof init === "string" && init.length > 0) {
            if (init[0] === "?") {
                init = init.slice(1);
            }

            this[_searchParams] = parse_search_params_ex(init);
        } else if (Array.isArray(init)) {
            this[_searchParams] = init.map((item) => {
                if (item.length !== 2) {
                    throw new TypeError(
                        "URLSearchParams: array item must be [key, value]",
                    );
                }

                return [String(item[0]), String(item[1])];
            });
        } else if (typeof init === "object") {
            this[_searchParams] = Object.entries(init).map(([key, value]) => {
                return [String(key), String(value)];
            });
        } else {
            throw new TypeError(
                "URLSearchParams: expect init to be one of string, array or object",
            );
        }
    }

    #update() {
        const url = this[_url];

        if (url) {
            url[_updateUrl](this.toString());
        }
    }

    get(name) {
        assertProto(this, URLSearchParams);
        name = getArgument(name, "get", "URLSearchParams.get");
        name = toString(name);

        let entries = this[_searchParams];
        for (let i = 0; i < entries.length; i++) {
            if (entries[i][0] === name) {
                return entries[i][1];
            }
        }

        return null;
    }

    getAll(name) {
        assertProto(this, URLSearchParams);
        name = getArgument(name, "getAll", "URLSearchParams.getAll");
        name = toString(name);

        let entries = this[_searchParams];
        return entries
            .filter((entry) => entry[0] === name)
            .map((entry) => entry[1]);
    }

    has(name, value = undefined) {
        assertProto(this, URLSearchParams);
        name = getArgument(name, "has", "URLSearchParams.has");
        name = toString(name);

        let entries = this[_searchParams];
        if (value === undefined) {
            return entries.some((entry) => entry[0] === name);
        }

        value = toString(value);
        return entries.some((entry) => entry[0] === name && entry[1] === value);
    }

    get size() {
        assertProto(this, URLSearchParams);
        return this[_searchParams].length;
    }

    toString() {
        assertProto(this, URLSearchParams);
        return stringify_search_params_ex(this[_searchParams]);
    }

    append(name, value) {
        name = getArgument(name, "append", "URLSearchParams.append");
        value = getArgument(value, "append", "URLSearchParams.append");
        name = toString(name);
        value = toString(value);

        this[_searchParams].push([name, value]);
        this.#update();
    }

    delete(name, value = undefined) {
        name = getArgument(name, "delete", "URLSearchParams.delete");
        name = toString(name);

        let list = this[_searchParams];
        let i = 0;

        if (value === undefined) {
            while (i < list.length) {
                if (list[i][0] === name) {
                    list.splice(i, 1);
                } else {
                    i++;
                }
            }
        } else {
            value = toString(value);
            while (i < list.length) {
                if (list[i][0] === name && list[i][1] === value) {
                    list.splice(i, 1);
                } else {
                    i++;
                }
            }
        }

        this.#update();
    }

    set(name, value) {
        name = getArgument(name, "set", "URLSearchParams.set");
        value = getArgument(value, "set", "URLSearchParams.set");
        name = toString(name);
        value = toString(value);

        let list = this[_searchParams];
        let found = false;
        for (let i = 0; i < list.length; i++) {
            if (list[i][0] === name) {
                if (!found) {
                    list[i][1] = value;
                    found = true;
                } else {
                    list.splice(i, 1);
                    i--;
                }
            }
        }

        if (!found) {
            list.push([name, value]);
        }

        this.#update();
    }

    sort() {
        this[_searchParams].sort((
            a,
            b,
        ) => (a[0] === b[0] ? 0 : a[0] > b[0] ? 1 : -1));

        this.#update();
    }
}

addWebIterators("URLSearchParams", URLSearchParams, _searchParams);

class URL {
    #host;
    #hostname;
    #href;
    #pathname;
    #port;
    #protocol;
    #search;
    #hash;
    #username;
    #password;
    #origin;
    #string;
    #query;

    constructor(input, base = "") {
        input = getArgument(input, "constructor", "URL");
        input = toString(input);

        if (base) {
            base = getArgument(base, "constructor", "URL");
            base = toString(base);
        }
        let value = base
            ? parse_url_with_base_ex(input, base)
            : parse_url_ex(input);

        this.#string = value.href;

        this.#update(value);
    }

    static parse(url, base = undefined) {
        try {
            return new URL(url, base);
        } catch {
            return null;
        }
    }

    #update(url) {
        this.#host = url.host;
        this.#hostname = url.hostname;
        this.#href = url.href;
        this.#pathname = url.pathname;
        this.#port = url.port;
        this.#protocol = url.protocol;
        this.#search = url.search;
        this.#hash = url.hash;
        this.#username = url.username;
        this.#password = url.password;
        this.#origin = url.origin;
    }

    #updateSearchParams() {
        if (this.#query) {
            const params = this.#query[_searchParams];
            const newParams = parse_search_params_ex(
                this.search.splice(1),
            );

            params.splice(0, params.length, ...newParams);
        }
    }

    [_updateUrl](value) {
        let url = update_url_ex(this.#string, "search", value);

        this.#update(
            url,
        );
    }

    static canParse(input, base = undefined) {
        input = getArgument(input, "canParse", "URL.canParse");
        input = toString(input);

        if (base) {
            base = getArgument(base, "canParse", "URL.canParse");
            base = toString(base);
        }

        try {
            new URL(input, base);
            return true;
        } catch {
            return false;
        }
    }

    get hash() {
        assertProto(this, URL);

        return this.#hash;
    }

    set hash(value) {
        assertProto(this, URL);

        value = getArgument(value, "set", "URL.hash");
        value = toString(value);

        try {
            let url = update_url_ex(this.#string, "hash", value);

            this.#update(url);
        } catch {}
    }

    get host() {
        assertProto(this, URL);

        return this.#host;
    }

    set host(value) {
        assertProto(this, URL);

        value = getArgument(value, "set", "URL.host");
        value = toString(value);

        try {
            let url = update_url_ex(this.#string, "host", value);

            this.#update(url);
        } catch {}
    }

    get hostname() {
        assertProto(this, URL);

        return this.#hostname;
    }

    set hostname(value) {
        assertProto(this, URL);

        value = getArgument(value, "set", "URL.hostname");
        value = toString(value);

        try {
            let url = update_url_ex(this.#string, "hostname", value);

            this.#update(url);
        } catch {}
    }

    get href() {
        assertProto(this, URL);

        return this.#href;
    }

    set href(value) {
        assertProto(this, URL);

        value = getArgument(value, "set", "URL.href");
        value = toString(value);

        try {
            let url = update_url_ex(this.#string, "href", value);

            this.#update(url);
            this.#updateSearchParams();
        } catch {}
    }

    get origin() {
        assertProto(this, URL);

        return this.#origin;
    }

    get password() {
        assertProto(this, URL);

        return this.#password;
    }

    set password(value) {
        assertProto(this, URL);

        value = getArgument(value, "set", "URL.password");
        value = toString(value);

        try {
            let url = update_url_ex(this.#string, "password", value);

            this.#update(url);
        } catch {}
    }

    get pathname() {
        assertProto(this, URL);

        return this.#pathname;
    }

    set pathname(value) {
        assertProto(this, URL);

        value = getArgument(value, "set", "URL.pathname");
        value = toString(value);

        try {
            let url = update_url_ex(this.#string, "pathname", value);

            this.#update(url);
        } catch {}
    }

    get port() {
        assertProto(this, URL);

        return this.#port.toString();
    }

    set port(value) {
        assertProto(this, URL);

        value = getArgument(value, "set", "URL.port");
        value = toString(value);

        try {
            let url = update_url_ex(this.#string, "port", value);

            this.#update(url);
        } catch {}
    }

    get protocol() {
        assertProto(this, URL);

        return this.#protocol;
    }

    set protocol(value) {
        assertProto(this, URL);

        value = getArgument(value, "set", "URL.protocol");
        value = toString(value);

        try {
            let url = update_url_ex(this.#string, "protocol", value);

            this.#update(url);
        } catch {}
    }

    get search() {
        assertProto(this, URL);

        return this.#search;
    }

    set search(value) {
        assertProto(this, URL);

        value = getArgument(value, "set", "URL.search");
        value = toString(value);

        try {
            let url = update_url_ex(this.#string, "search", value);

            this.#update(url);
            this.#updateSearchParams();
        } catch {}
    }

    get username() {
        assertProto(this, URL);

        return this.#username;
    }

    set username(value) {
        assertProto(this, URL);

        value = getArgument(value, "set", "URL.username");
        value = toString(value);

        try {
            let url = update_url_ex(this.#string, "username", value);

            this.#update(url);
        } catch {}
    }

    get searchParams() {
        if (!this.#query) {
            this.#query = new URLSearchParams(this.#search);
            this.#query[_url] = this;
        }

        return this.#query;
    }

    toString() {
        assertProto(this, URL);

        return this.#string;
    }

    toJSON() {
        assertProto(this, URL);

        return this.#string;
    }
}

export { URL, URLSearchParams };
