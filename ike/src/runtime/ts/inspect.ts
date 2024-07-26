const formatRegExp = /%[sdj%]/g;

export const format = (f: any, ...args: any[]): string => {
  if (typeof f !== 'string') {
    return args.map((arg) => inspect(arg)).join(' ');
  }

  let i = 0;
  const len = args.length;
  let str = String(f).replace(formatRegExp, (x) => {
    if (x === '%%') return '%';
    if (i >= len) return x;
    switch (x) {
      case '%s':
        return String(args[i++]);
      case '%d':
        return String(Number(args[i++]));
      case '%j':
        try {
          return JSON.stringify(args[i++]);
        } catch (_) {
          return '[Circular]';
        }
      default:
        return x;
    }
  });

  while (i < len) {
    const x = args[i++];
    str += ' ' + (x === null || typeof x !== 'object' ? x : inspect(x));
  }

  return str;
};

export const inspect = (obj: any, opts: any = {}): string => {
  const ctx: any = {
    seen: [],
    stylize: stylizeNoColor,
    showHidden: false,
    depth: 2,
    colors: false,
    customInspect: true,
    ...opts,
  };

  if (ctx.colors) ctx.stylize = stylizeWithColor;

  return formatValue(ctx, obj, ctx.depth);
};

const inspectColors: Record<string, [number, number]> = {
  bold: [1, 22],
  italic: [3, 23],
  underline: [4, 24],
  inverse: [7, 27],
  white: [37, 39],
  grey: [90, 39],
  black: [30, 39],
  blue: [34, 39],
  cyan: [36, 39],
  green: [32, 39],
  magenta: [35, 39],
  red: [31, 39],
  yellow: [33, 39],
};

const inspectStyles: Record<string, string> = {
  special: 'cyan',
  number: 'yellow',
  boolean: 'yellow',
  undefined: 'grey',
  null: 'bold',
  string: 'green',
  date: 'magenta',
  regexp: 'red',
};

const stylizeWithColor = (str: string, styleType: string): string => {
  const style = inspectStyles[styleType];
  if (style) {
    return `\u001b[${inspectColors[style][0]}m${str}\u001b[${inspectColors[style][1]}m`;
  }
  return str;
};

const stylizeNoColor = (str: string): string => str;

const arrayToHash = (array: string[]): Record<string, boolean> =>
  array.reduce(
    (hash, val) => {
      hash[val] = true;
      return hash;
    },
    {} as Record<string, boolean>,
  );

const formatValue = (
  ctx: any,
  value: any,
  recurseTimes: number | null,
): string => {
  if (
    ctx.customInspect &&
    value &&
    typeof value.inspect === 'function' &&
    value.inspect !== inspect &&
    !(value.constructor && value.constructor.prototype === value)
  ) {
    let ret = value.inspect(recurseTimes, ctx);
    if (typeof ret !== 'string') {
      ret = formatValue(ctx, ret, recurseTimes);
    }
    return ret;
  }

  if (value === undefined) return ctx.stylize('undefined', 'undefined');
  if (typeof value === 'string') return ctx.stylize(`'${value}'`, 'string');
  if (typeof value === 'number') return ctx.stylize('' + value, 'number');
  if (typeof value === 'boolean') return ctx.stylize('' + value, 'boolean');
  if (value === null) return ctx.stylize('null', 'null');
  if (value instanceof RegExp) return ctx.stylize(value.toString(), 'regexp');
  if (value instanceof Date) return ctx.stylize(value.toISOString(), 'date');
  if (value instanceof Error) return formatError(value);

  const keys = Object.keys(value);
  const visibleKeys = arrayToHash(keys);

  if (ctx.showHidden) {
    keys.push(...Object.getOwnPropertyNames(value));
  }

  if (keys.length === 0) {
    if (typeof value === 'function')
      return ctx.stylize('[Function]', 'special');
    return ctx.stylize('[Object]', 'special');
  }

  if (recurseTimes !== null && recurseTimes < 0) {
    return ctx.stylize('[Object]', 'special');
  }

  ctx.seen.push(value);

  const output = Array.isArray(value)
    ? formatArray(ctx, value, recurseTimes, visibleKeys, keys)
    : keys.map((key) =>
        formatProperty(
          ctx,
          value,
          recurseTimes,
          visibleKeys,
          key,
          Array.isArray(value),
        ),
      );

  ctx.seen.pop();

  return reduceToSingleString(
    output,
    '',
    Array.isArray(value) ? ['[', ']'] : ['{', '}'],
  );
};

const formatError = (value: Error): string => `[${value.toString()}]`;

const formatArray = (
  ctx: any,
  value: any[],
  recurseTimes: number | null,
  visibleKeys: Record<string, boolean>,
  keys: string[],
): string[] => {
  const output: string[] = [];
  value.forEach((item, i) => {
    output.push(
      Object.prototype.hasOwnProperty.call(value, String(i))
        ? formatProperty(ctx, value, recurseTimes, visibleKeys, String(i), true)
        : '',
    );
  });
  keys.forEach((key) => {
    if (!/^\d+$/.test(key)) {
      output.push(
        formatProperty(ctx, value, recurseTimes, visibleKeys, key, true),
      );
    }
  });
  return output;
};

const formatProperty = (
  ctx: any,
  value: any,
  recurseTimes: number | null,
  visibleKeys: Record<string, boolean>,
  key: string,
  array: boolean,
): string => {
  let name: string | undefined, str: string | undefined;
  const desc = Object.getOwnPropertyDescriptor(value, key) || {
    value: value[key],
  };
  if (desc.get) {
    str = ctx.stylize(desc.set ? '[Getter/Setter]' : '[Getter]', 'special');
  } else if (desc.set) {
    str = ctx.stylize('[Setter]', 'special');
  }
  if (!Object.prototype.hasOwnProperty.call(visibleKeys, key)) {
    name = '[' + key + ']';
  }
  if (!str) {
    if (ctx.seen.indexOf(desc.value) < 0) {
      str = formatValue(
        ctx,
        desc.value,
        recurseTimes === null ? null : recurseTimes - 1,
      );
      if (str.includes('\n')) {
        str = array
          ? str
              .split('\n')
              .map((line) => '  ' + line)
              .join('\n')
              .slice(2)
          : '\n' +
            str
              .split('\n')
              .map((line) => '   ' + line)
              .join('\n');
      }
    } else {
      str = ctx.stylize('[Circular]', 'special');
    }
  }
  if (name === undefined) {
    name =
      array && /^\d+$/.test(key)
        ? ''
        : JSON.stringify('' + key)
            .replace(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/, '$1')
            .replace(/'/g, "\\'")
            .replace(/\\"/g, '"')
            .replace(/(^"|"$)/g, "'");
    name = ctx.stylize(name, 'name');
  }
  return name + ': ' + str;
};

const reduceToSingleString = (
  output: string[],
  base: string,
  braces: [string, string],
): string => {
  const length = output.reduce(
    (prev, cur) => prev + cur.replace(/\u001b\[\d\d?m/g, '').length + 1,
    0,
  );
  if (length > 60) {
    return (
      braces[0] +
      (base ? base + '\n ' : '') +
      ' ' +
      output.join(',\n  ') +
      ' ' +
      braces[1]
    );
  }
  return braces[0] + base + ' ' + output.join(', ') + ' ' + braces[1];
};
