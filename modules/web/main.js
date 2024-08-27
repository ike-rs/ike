import { assertProto } from '@std/assert';

const ASCII_DIGIT = ['\u0030-\u0039'];
const ASCII_UPPER_ALPHA = ['\u0041-\u005A'];
const ASCII_LOWER_ALPHA = ['\u0061-\u007A'];
const ASCII_ALPHA = [...ASCII_UPPER_ALPHA, ...ASCII_LOWER_ALPHA];
const ASCII_ALPHANUMERIC = [...ASCII_DIGIT, ...ASCII_ALPHA];

function regexMatcher(chars) {
  const matchers = chars.map((char) =>
    char.length === 1
      ? `\\u${char.charCodeAt(0).toString(16).padStart(4, '0')}`
      : char.length === 3 && char[1] === '-'
        ? `\\u${char.charCodeAt(0).toString(16).padStart(4, '0')}-\\u${char
            .charCodeAt(2)
            .toString(16)
            .padStart(4, '0')}`
        : (() => {
            throw new TypeError('unreachable');
          })(),
  );
  return matchers.join('');
}

const HTTP_TOKEN_CODE_POINT = [
  '\u0021',
  '\u0023',
  '\u0024',
  '\u0025',
  '\u0026',
  '\u0027',
  '\u002A',
  '\u002B',
  '\u002D',
  '\u002E',
  '\u005E',
  '\u005F',
  '\u0060',
  '\u007C',
  '\u007E',
  ...ASCII_ALPHANUMERIC,
];
const HTTP_TAB_OR_SPACE = ['\u0009', '\u0020'];
const HTTP_WHITESPACE = ['\u000A', '\u000D', ...HTTP_TAB_OR_SPACE];
const HTTP_WHITESPACE_MATCHER = regexMatcher(HTTP_WHITESPACE);
const HTTP_BETWEEN_WHITESPACE = new RegExp(
  `^[${HTTP_WHITESPACE_MATCHER}]*(.*?)[${HTTP_WHITESPACE_MATCHER}]*$`,
);
const HTTP_TOKEN_CODE_POINT_RE = new RegExp(
  `^[${regexMatcher(HTTP_TOKEN_CODE_POINT)}]+$`,
);

const checkForInvalidValueChars = (value) => {
  for (let i = 0; i < value.length; i++) {
    const c = value.charCodeAt(i);

    if (c === 0x0a || c === 0x0d || c === 0x00) {
      return false;
    }
  }

  return true;
};

let HEADER_NAME_CACHE = { __proto__: null };
let HEADER_CACHE_SIZE = 0;
const HEADER_NAME_CACHE_SIZE_BOUNDARY = 4096;
const checkHeaderNameForHttpTokenCodePoint = (name) => {
  const fromCache = HEADER_NAME_CACHE[name];
  if (fromCache !== undefined) {
    return fromCache;
  }

  const valid = HTTP_TOKEN_CODE_POINT_RE.test(name);

  if (HEADER_CACHE_SIZE > HEADER_NAME_CACHE_SIZE_BOUNDARY) {
    HEADER_NAME_CACHE = { __proto__: null };
    HEADER_CACHE_SIZE = 0;
  }
  HEADER_CACHE_SIZE++;
  HEADER_NAME_CACHE[name] = valid;

  return valid;
};

const isHttpWhitespace = (char) => {
  switch (char) {
    case '\u0009':
    case '\u000A':
    case '\u000D':
    case '\u0020':
      return true;
    default:
      return false;
  }
};

const httpTrim = (s) => {
  if (!isHttpWhitespace(s[0]) && !isHttpWhitespace(s[s.length - 1])) {
    return s;
  }
  return s.match(HTTP_BETWEEN_WHITESPACE)?.[1] ?? '';
};

const normalizeHeaderValue = (potentialValue) => {
  return httpTrim(potentialValue);
};

const addWebIterators = (name, proto, symbol) => {
  const iteratorPrototype = Object.create(
    Object.getPrototypeOf([][Symbol.iterator]()),
    {
      [Symbol.toStringTag]: {
        configurable: true,
        value: `${name} Iterator`,
      },
    },
  );

  Object.defineProperty(iteratorPrototype, 'next', {
    value() {
      const { target, index, kind } = this;
      const values = target[symbol];
      const len = values.length;
      if (index >= len) {
        return { value: undefined, done: true };
      }
      const pair = values[index];
      this.index = index + 1;
      let result;

      switch (kind) {
        case 'entry':
          result = [pair[0], pair[1]];
          break;
        case 'key':
          result = pair[0];
          break;
        case 'value':
          result = pair[1];
          break;
      }

      return { value: result, done: false };
    },
    writable: true,
    configurable: true,
  });

  const createIter = (target, kind) => {
    const iter = Object.create(iteratorPrototype);

    iter.index = 0;
    iter.target = target;
    iter.kind = kind;

    return iter;
  };

  return Object.defineProperties(proto.prototype, {
    entries: {
      enumerable: true,
      configurable: true,
      writable: true,
      value: function entries() {
        assertProto(this, proto);
        return createIter(this, 'entry');
      },
    },
    keys: {
      enumerable: true,
      configurable: true,
      writable: true,
      value: function keys() {
        assertProto(this, proto);
        return createIter(this, 'key');
      },
    },
    values: {
      enumerable: true,
      configurable: true,
      writable: true,
      value: function values() {
        assertProto(this, proto);
        return createIter(this, 'value');
      },
    },
    forEach: {
      enumerable: true,
      configurable: true,
      writable: true,
      value: function forEach(callback, thisArg) {
        assertProto(this, proto);
        const values = this[symbol];
        for (let i = 0; i < values.length; i++) {
          const pair = values[i];
          callback.call(thisArg, pair[1], pair[0], this);
        }
      },
    },
    [Symbol.iterator]: {
      enumerable: true,
      configurable: true,
      writable: true,
      value() {
        assertProto(this, proto);
        return createIter(this, 'entry');
      },
    },
  });
};

export {
  addWebIterators,
  checkForInvalidValueChars,
  checkHeaderNameForHttpTokenCodePoint,
  httpTrim,
  normalizeHeaderValue,
};
