import { colorCodes, colors } from "@std/format";

const DEFAULT_INDENT = "  ";

const inspectArgs = (args, ctx = {}) => {
    const first = args[0];
    let a = 0;
    let string = "";

    if (typeof first === "string" && args.length > 1) {
        a++;
        let appendedChars = 0;
        let usedStyle = false;
        let prevCss = null;
        for (let i = 0; i < first.length - 1; i++) {
            if (first[i] === "%") {
                const char = first[++i];
                if (a < args.length) {
                    let formattedArg = null;
                    if (char === "s") {
                        formattedArg = String(args[a++]);
                    } else if (char === "d" || char === "i") {
                        const value = args[a++];
                        if (typeof value === "bigint") {
                            formattedArg = `${value}n`;
                        } else if (typeof value === "number") {
                            formattedArg = `${parseInt(value)}`;
                        } else {
                            formattedArg = "NaN";
                        }
                    } else if (char === "f") {
                        const value = args[a++];
                        formattedArg = typeof value === "number"
                            ? `${value}`
                            : "NaN";
                    } else if (char === "O" || char === "o") {
                        formattedArg = formatValue(ctx, args[a++], 0);
                    } else if (char === "c") {
                        const value = args[a++];

                        // TODO: implement colors
                    }

                    if (formattedArg !== null) {
                        string += first.slice(appendedChars, i - 1) +
                            formattedArg;
                        appendedChars = i + 1;
                    }
                }
                if (char === "%") {
                    string += first.slice(appendedChars, i - 1) + "%";
                    appendedChars = i + 1;
                }
            }
        }
        string += first.slice(appendedChars);
        if (usedStyle) {
            string += "\x1b[0m";
        }
    }

    for (; a < args.length; a++) {
        if (a > 0) {
            string += " ";
        }
        if (typeof args[a] === "string") {
            string += args[a];
        } else {
            string += formatValue(ctx, args[a], 0);
        }
    }

    if (ctx.indentationLvl > 0) {
        const groupIndent = " ".repeat(DEFAULT_INDENT * ctx.indentationLvl);
        string = groupIndent + string.replace(/\n/g, `\n${groupIndent}`);
    }

    return string;
};

const getKeys = (value, showHidden) => {
    let keys;
    const symbols = Object.getOwnPropertySymbols(value);

    if (showHidden) {
        keys = Object.getOwnPropertyNames(value);
        if (symbols.length) {
            keys.push(...symbols);
        }
    } else {
        try {
            keys = value.values !== undefined
                ? [...value.values()]
                : Object.keys(value);
        } catch (err) {
            if (err.name === "ReferenceError" && typeof value === "object") {
                keys = Object.getOwnPropertyNames(value);
            } else {
                throw err;
            }
        }

        if (symbols.length) {
            keys.push(
                ...symbols.filter((key) => value.propertyIsEnumerable(key)),
            );
        }
    }

    return keys;
};

let consoleProxy = Symbol.for("consoleProxy");

const inspect = (value, options) => {
    return formatValue(makeOptions(0), value, options.depth);
};

const formatPrimitiveRegExp = new RegExp("(?<=\n)");
const formatPrimitive = (value, ctx) => {
    if (typeof value === "string") {
        let trailer = "";
        if (value.length > ctx.maxStringLength) {
            const remaining = value.length - ctx.maxStringLength;
            value = StringPrototypeSlice(value, 0, ctx.maxStringLength);
            trailer = colors.dim(
                `... ${remaining} more character${remaining > 1 ? "s" : ""}`,
            );
        }

        if (value.length > ctx.breakLength) {
            return value
                .split(formatPrimitiveRegExp)
                .map((line) => fn(quoteString(line, ctx), "string"))
                .join(` +\n${" ".repeat(ctx.indentationLvl + 2)}`) + trailer;
        }
    } else if (typeof value === "number") {
        return formatNumber(value);
    } else if (typeof value === "boolean") {
        return colors.yellow(`${value}`);
    } else if (typeof value === "bigint") {
        return formatBigInt(value);
    } else if (typeof value === "undefined") {
        return colors.dim("undefined");
    } else if (typeof value === "symbol") {
        return colors.blue(
            `Symbol${value.description ? `(${value.description})` : ""}`,
        );
    }
};

const formatBigInt = (value) => {
    return colors.yellow(`${value}n`);
};

const formatNumber = (value) => {
    return colors.yellow(Object.is(value, -0) ? "-0" : `${value}`);
};

const formatValue = (ctx, value, recurseTimes) => {
    if (value === null) {
        return colors.yellow("null");
    }

    if (typeof value !== "object" && typeof value !== "function") {
        return formatPrimitive(value, ctx);
    }

    if (Reflect.has(value, consoleProxy)) {
        return String(value[consoleProxy](
            inspect,
            ctx,
        ));
    }

    try {
        if (ctx.seen.includes(value)) {
            let index = 1;

            if (ctx.circular === undefined) {
                ctx.circular = new Map();
                ctx.circular.set(value, index);
            } else {
                index = ctx.circular.get(value);

                if (index === undefined) {
                    index = ctx.circular.size + 1;
                    ctx.circular.set(value, index);
                }
            }

            return colors.yellow(`[Circular *${colors.gray(`[${index}]`)}]`);
        }
    } catch (err) {}

    return actualFormat(ctx, value, recurseTimes);
};

const formatSet = (ctx, value, recurseTimes) => {
    ctx.indentationLvl += 2;

    const vals = [...value];
    let valuesLen = vals.length;
    const len = Math.min(
        Math.max(0, ctx.iterableLimit),
        valuesLen,
    );

    let output = [];
    let remaining = valuesLen - len;

    for (let i = 0; i < len; i++) {
        output.push(formatKey(
            ctx,
            vals[i],
            recurseTimes,
        ));
    }

    if (remaining > 0) {
        output.push(
            colors.dim(
                `... ${valuesLen - len} more item${
                    valuesLen - len > 1 ? "s" : ""
                }`,
            ),
        );
    }

    ctx.indentationLvl -= 2;

    return output;
};

const actualFormat = (ctx, value, recurseTimes) => {
    let fn = () => [];
    let braces = ["{", "}"];
    let keys = [];
    let type = "objectLike";

    if (Reflect.has(value, Symbol.iterator)) {
        if (value instanceof Set) {
            const size = value.size;
            keys = getKeys(value, false);

            if (size === 0 && keys.length === 0) {
                return "Set {}";
            }

            fn = formatSet;
            braces = [`Set(${size}) {`, "}"];
        } else if (value instanceof Map) {
            const size = value.size;
            keys = getKeys(value, false);

            if (size === 0 && keys.length === 0) {
                return "Map {}";
            }

            fn = formatMap;
            braces = [`Map(${size}) {`, "}"];
            type = "mapLike";
        } else if (isTypedArray(value)) {
            const size = value.byteLength;

            if (size === 0) {
                return `${value.constructor.name} []`;
            }

            fn = formatTypedArray;
            braces = [`${value.constructor.name}(${size}) {`, "}"];
            type = "typedArray";
        }
    } else {
        if (value instanceof Date) {
            if (isNaN(value.getTime())) {
                return colors.red("Invalid Date");
            } else {
                return colors.yellow(value.toISOString());
            }
        } else if (value instanceof RegExp) {
            return colors.red(value.toString());
        } else if (value instanceof Promise) {
            const state = get_promise_state_ex(value);

            return `Promise { ${colors.cyan(`<${state}>`)} }`;
        } else if (
            value instanceof SharedArrayBuffer || value instanceof ArrayBuffer
        ) {
            let bufferName = value.constructor.name;
            braces = [`${bufferName} {`, "}"];

            fn = formatAnyArrayBuffer;
        } else if (typeof value === "function" || value instanceof Function) {
            let name = value.name;
            let constructorName = value.constructor
                ? value.constructor.name
                : "";

            return colors.cyan(
                `[${constructorName}${name ? `: ${name}` : ""}]`,
            );
        } else if (value instanceof Error) {
            let name = value.name || "Error";

            return `${colors.red(`${name === "Error" ? "error" : name}`)}${
                colors.dim(`:`)
            } ${value.message}`;
        } else if (value instanceof DataView) {
            braces = ["DataView {", "}"];

            fn = (ctx, value, recurseTimes) => {
                let buffer = value.buffer;
                let byteOffset = value.byteOffset;
                let byteLength = value.byteLength;
                let output = [
                    `byteLength: ${formatValue(ctx, byteLength, recurseTimes)}`,
                    `byteOffset: ${formatValue(ctx, byteOffset, recurseTimes)}`,
                ];
                ctx.indentationLvl += 2;
                output.push(
                    `buffer: ${formatValue(ctx, buffer, recurseTimes)}`,
                );
                ctx.indentationLvl -= 2;

                return output;
            };
        }
    }

    if (recurseTimes > ctx.depth && ctx.depth !== null) {
        let name = value.constructor ? value.constructor.name : "Object";

        return colors.cyan(`[${name}]`);
    }
    recurseTimes += 1;

    ctx.seen.push(value);
    ctx.currentDepth = recurseTimes;

    let output = fn(ctx, value, recurseTimes);

    if (ctx.circular !== undefined) {
        let val = ctx.seen.get(value);

        if (val !== undefined) {
            braces[0] = `${colors.cyan(`<ref *${val}>`)} ${braces[0]}`;
        }
    }
    ctx.seen.pop();

    return stringifyFormat(
        ctx,
        output,
        "",
        braces,
        recurseTimes,
        value,
        type,
    );
};

const isTypedArray = (value) => {
    return value instanceof Int8Array ||
        value instanceof Uint8Array ||
        value instanceof Uint8ClampedArray ||
        value instanceof Int16Array ||
        value instanceof Uint16Array ||
        value instanceof Int32Array ||
        value instanceof Uint32Array ||
        value instanceof Float32Array ||
        value instanceof Float64Array ||
        value instanceof BigInt64Array ||
        value instanceof BigUint64Array;
};

const formatTypedArray = (ctx, value, recurseTimes) => {
    let length = value.byteLength;
    const maxLength = Math.min(Math.max(0, ctx.maxArrayLength), length);
    const remaining = length - maxLength;
    let fn = typeof value[0] === "number" ? formatNumber : formatBigInt;
    let returnValue = value.map((val, i) => {
        if (i >= maxLength) {
            return;
        }

        return fn(val);
    });
    let str = "";
    returnValue.forEach((val, i) => {
        if (i < maxLength) {
            str += (i > 0 ? ", " : "") + fn(val);
        }
    });
    const output = [
        str,
    ];
    if (remaining > 0) {
        output.push(
            colors.dim(`... ${remaining} more item${remaining > 1 ? "s" : ""}`),
        );
    }
    return output;
};

const formatAnyArrayBuffer = (ctx, value, recurseTimes) => {
    let valLen = (value.byteLength || value.byteLength) ?? 0;
    const len = Math.min(Math.max(0, ctx.maxArrayLength), valLen);

    let buffer;
    try {
        buffer = new Uint8Array(value, 0, len);
    } catch {
        return [colors.red("(detached)")];
    }

    let str = buffer.reduce(
        (acc, byte) => acc + byte.toString(16).padStart(2, "0") + " ",
        "",
    ).trim();
    const remaining = valLen - len;

    if (remaining > 0) {
        str += colors.dim(
            ` ... ${remaining} more byte${remaining > 1 ? "s" : ""}`,
        );
    }

    return [
        `${colors.cyan("[Uint8Contents]")}: <${str}>`,
        `byteLength: ${formatValue(ctx, valLen, recurseTimes)}`,
    ];
};

const formatMap = (ctx, value, recurseTimes) => {
    ctx.indentationLvl += 2;

    const entries = [...value];
    let entriesLen = entries.length;
    const len = Math.min(
        Math.max(0, ctx.iterableLimit),
        entriesLen,
    );

    let output = [];
    let remaining = entriesLen - len;

    for (let i = 0; i < len; i++) {
        const [key, val] = entries[i];
        output.push(
            `${formatKey(ctx, key, recurseTimes)} => ${
                formatVal(
                    ctx,
                    val,
                    recurseTimes,
                    key,
                )
            }`,
        );
    }

    if (remaining > 0) {
        output.push(
            colors.dim(
                `... ${entriesLen - len} more item${
                    entriesLen - len > 1 ? "s" : ""
                }`,
            ),
        );
    }

    ctx.indentationLvl -= 2;

    return output;
};

const formatKey = (ctx, key, recurseTimes) => {
    let name = key;

    if (typeof key === "symbol") {
        name = colors.blue(`[${key.toString()}]`);
    } else if (typeof key === "string") {
        name = colors.green('"' + key + '"');
    } else {
        name = formatValue(ctx, key, recurseTimes);
    }

    return name;
};

const formatVal = (ctx, value, recurseTimes, key) => {
    let val = null;
    let desc = Object.getOwnPropertyDescriptor(value, key) || {
        value: value[key],
        enumerable: true,
    };

    if (typeof value === "string") {
        val = colors.green('"' + value + '"');
    } else {
        val = formatValue(ctx, value, recurseTimes);
    }

    return val;
};

const stringifyFormat = (
    ctx,
    output,
    base,
    braces,
    type,
) => {
    if (type === "typedArray") {
        if (typeof ctx.compact === "number" && ctx.compact >= 1) {
            const entries = output.length;

            const start = output.length + ctx.indentationLvl +
                braces[0].length + base.length + 10;
            if (isBelowBreakLength(ctx, output, start, base)) {
                const joinedOutput = output.join(", ");
                if (!joinedOutput.includes("\n")) {
                    return `${base ? `${base} ` : ""}${
                        braces[0]
                    } ${joinedOutput} ${braces[1]}`;
                }
            }
        }

        const indentation = `${" ".repeat(ctx.indentationLvl)}`;
        return `${base ? `${base} ` : ""}${braces[0]}${indentation}  ${
            output.join(`,${indentation} `)
        }${ctx.trailingComma ? "," : ""}${indentation}${braces[1]}`;
    }

    const indentation = `\n${" ".repeat(ctx.indentationLvl)}`;

    return `${base ? `${base} ` : ""}${braces[0]}${indentation}  ${
        output.join(`,${indentation}  `)
    }${ctx.trailingComma ? "," : ""}${indentation}${braces[1]}`;
};

const isBelowBreakLength = (ctx, output, start, base) => {
    let totalLength = output.length + start;

    if (totalLength + output.length > ctx.breakLength) return false;

    totalLength += output.reduce(
        (sum, item) => sum + (removeColors(item).length),
        0,
    );

    return totalLength <= ctx.breakLength &&
        (base === "" || !base.includes("\n"));
};

const colorRegExp = new RegExp("\u001b\\[\\d\\d?m", "g");
const removeColors = (str) => str.replace(colorRegExp, "");

const makeOptions = (indent) => {
    return {
        indentationLvl: indent,
        seen: [],
        breakLength: 70,
        maxStringLength: 10_000,
        iterableLimit: 100,
        depth: 4,
        currentDepth: 0,
        maxArrayLength: 100,
    };
};

const createConsoleProxy = ({ name, keys }) => {
    const obj = class {};
    Object.defineProperty(obj, "name", {
        value: name,
        writable: false,
        enumerable: false,
        configurable: true,
    });

    return new Proxy(new obj(), {
        get(target, prop) {
            if (prop === Symbol.toStringTag) {
                return name;
            }

            return keys.includes(prop) ? Reflect.get(target, prop) : undefined;
        },
        ownKeys() {
            return keys;
        },
    });
};

class Console {
    constructor() {
        this.indent = 0;

        const console = Object.create({}, {
            [Symbol.toStringTag]: {
                value: "console",
                writable: false,
                enumerable: false,
                configurable: true,
            },
        });

        Object.assign(
            console,
            this,
        );

        return console;
    }

    log = (...args) => {
        print_ex(
            inspectArgs(args, makeOptions(this.indent)) + "\n",
            1,
        );
    };
}

export { Console, createConsoleProxy };
