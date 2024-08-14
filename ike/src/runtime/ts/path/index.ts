/**
 * This code is fully taken from https://github.com/unjs/pathe
 * License: MIT https://github.com/unjs/pathe/blob/main/LICENSE
 */

type PathString = string;

interface PathModule {
  normalize: (path: PathString) => PathString;
  join: (...paths: PathString[]) => PathString;
  resolve: (...paths: PathString[]) => PathString;
  isAbsolute: (path: PathString) => boolean;
  toNamespacedPath: (path: PathString) => PathString;
  extname: (path: PathString | undefined) => PathString;
  relative: (from: PathString, to: PathString) => PathString;
  dirname: (path: PathString) => PathString;
  format: (pathObject: PathObject) => PathString;
  basename: (path: PathString, ext?: PathString) => PathString;
  parse: (path: PathString) => PathObject;
}

interface PathObject {
  root: PathString;
  dir: PathString;
  base: PathString;
  ext: PathString;
  name: PathString;
}

const _DRIVE_LETTER_START_RE = /^[A-Za-z]:\//;

export const normalizeWindowsPath = (input = ''): string => {
  if (!input) {
    return input;
  }
  return input
    .replace(/\\/g, '/')
    .replace(_DRIVE_LETTER_START_RE, (r) => r.toUpperCase());
};

const _UNC_REGEX = /^[/\\]{2}/;
const _IS_ABSOLUTE_RE = /^[/\\](?![/\\])|^[/\\]{2}(?!\.)|^[A-Za-z]:[/\\]/;
const _DRIVE_LETTER_RE = /^[A-Za-z]:$/;
const _ROOT_FOLDER_RE = /^\/([A-Za-z]:)?$/;

export const sep: string = '/';
export const delimiter: string = Ike.isWindows() ? ';' : ':';

export const normalize: PathModule['normalize'] = function (
  path: string,
): string {
  if (path.length === 0) {
    return '.';
  }

  path = normalizeWindowsPath(path);

  const isUNCPath = path.match(_UNC_REGEX);
  const isPathAbsolute = isAbsolute(path);
  const trailingSeparator = path[path.length - 1] === '/';

  path = normalizeString(path, !isPathAbsolute);

  if (path.length === 0) {
    if (isPathAbsolute) {
      return '/';
    }
    return trailingSeparator ? './' : '.';
  }
  if (trailingSeparator) {
    path += '/';
  }
  if (_DRIVE_LETTER_RE.test(path)) {
    path += '/';
  }

  if (isUNCPath) {
    if (!isPathAbsolute) {
      return `//./${path}`;
    }
    return `//${path}`;
  }

  return isPathAbsolute && !isAbsolute(path) ? `/${path}` : path;
};

function cwd() {
  if (typeof Ike !== 'undefined' && typeof Ike.cwd === 'function') {
    return Ike.cwd().replace(/\\/g, '/');
  }
  return '/';
}

export const join: PathModule['join'] = function (...arguments_): string {
  if (arguments_.length === 0) {
    return '.';
  }

  let joined: string | undefined;
  for (const argument of arguments_) {
    if (argument && argument.length > 0) {
      if (joined === undefined) {
        joined = argument;
      } else {
        joined += `/${argument}`;
      }
    }
  }
  if (joined === undefined) {
    return '.';
  }

  return normalize(joined.replace(/\/\/+/g, '/'));
};

export const resolve: PathModule['resolve'] = function (...arguments_): string {
  arguments_ = arguments_.map((argument) => normalizeWindowsPath(argument));

  let resolvedPath = '';
  let resolvedAbsolute = false;

  for (
    let index = arguments_.length - 1;
    index >= -1 && !resolvedAbsolute;
    index--
  ) {
    const path = index >= 0 ? arguments_[index] : cwd();

    if (!path || path.length === 0) {
      continue;
    }

    resolvedPath = `${path}/${resolvedPath}`;
    resolvedAbsolute = isAbsolute(path);
  }

  resolvedPath = normalizeString(resolvedPath, !resolvedAbsolute);

  if (resolvedAbsolute && !isAbsolute(resolvedPath)) {
    return `/${resolvedPath}`;
  }

  return resolvedPath.length > 0 ? resolvedPath : '.';
};

export const normalizeString = (
  path: string,
  allowAboveRoot: boolean,
): string => {
  let res = '';
  let lastSegmentLength = 0;
  let lastSlash = -1;
  let dots = 0;
  let char: string | null = null;
  for (let index = 0; index <= path.length; ++index) {
    if (index < path.length) {
      char = path[index];
    } else if (char === '/') {
      break;
    } else {
      char = '/';
    }
    if (char === '/') {
      if (lastSlash === index - 1 || dots === 1) {
        // NOOP
      } else if (dots === 2) {
        if (
          res.length < 2 ||
          lastSegmentLength !== 2 ||
          res[res.length - 1] !== '.' ||
          res[res.length - 2] !== '.'
        ) {
          if (res.length > 2) {
            const lastSlashIndex = res.lastIndexOf('/');
            if (lastSlashIndex === -1) {
              res = '';
              lastSegmentLength = 0;
            } else {
              res = res.slice(0, lastSlashIndex);
              lastSegmentLength = res.length - 1 - res.lastIndexOf('/');
            }
            lastSlash = index;
            dots = 0;
            continue;
          } else if (res.length > 0) {
            res = '';
            lastSegmentLength = 0;
            lastSlash = index;
            dots = 0;
            continue;
          }
        }
        if (allowAboveRoot) {
          res += res.length > 0 ? '/..' : '..';
          lastSegmentLength = 2;
        }
      } else {
        if (res.length > 0) {
          res += `/${path.slice(lastSlash + 1, index)}`;
        } else {
          res = path.slice(lastSlash + 1, index);
        }
        lastSegmentLength = index - lastSlash - 1;
      }
      lastSlash = index;
      dots = 0;
    } else if (char === '.' && dots !== -1) {
      ++dots;
    } else {
      dots = -1;
    }
  }
  return res;
};

export const isAbsolute: PathModule['isAbsolute'] = function (p): boolean {
  return _IS_ABSOLUTE_RE.test(p);
};

export const toNamespacedPath: PathModule['toNamespacedPath'] = function (
  p,
): string {
  return normalizeWindowsPath(p);
};

const _EXTNAME_RE = /.(\.[^./]+)$/;
export const extname: PathModule['extname'] = function (p): string {
  const match = _EXTNAME_RE.exec(normalizeWindowsPath(p));
  return (match && match[1]) || '';
};

export const relative: PathModule['relative'] = function (from, to): string {
  const _from = resolve(from).replace(_ROOT_FOLDER_RE, '$1').split('/');
  const _to = resolve(to).replace(_ROOT_FOLDER_RE, '$1').split('/');

  if (_to[0][1] === ':' && _from[0][1] === ':' && _from[0] !== _to[0]) {
    return _to.join('/');
  }

  const _fromCopy = [..._from];
  for (const segment of _fromCopy) {
    if (_to[0] !== segment) {
      break;
    }
    _from.shift();
    _to.shift();
  }
  return [..._from.map(() => '..'), ..._to].join('/');
};

export const dirname: PathModule['dirname'] = function (p): string {
  const segments = normalizeWindowsPath(p)
    .replace(/\/$/, '')
    .split('/')
    .slice(0, -1);
  if (segments.length === 1 && _DRIVE_LETTER_RE.test(segments[0])) {
    segments[0] += '/';
  }
  return segments.join('/') || (isAbsolute(p) ? '/' : '.');
};

export const format: PathModule['format'] = function (p): string {
  const segments = [p.root, p.dir, p.base ?? p.name + p.ext].filter(Boolean);
  return normalizeWindowsPath(
    p.root ? resolve(...segments) : segments.join('/'),
  );
};

export const basename: PathModule['basename'] = function (
  p,
  extension,
): string {
  const lastSegment = normalizeWindowsPath(p).split('/').pop();
  if (lastSegment === undefined) return '';
  return extension && lastSegment.endsWith(extension)
    ? lastSegment.slice(0, -extension.length)
    : lastSegment;
};

export const parse: PathModule['parse'] = function (p): PathObject {
  const root = normalizeWindowsPath(p).split('/').shift() || '/';
  const base = basename(p);
  const extension = extname(base);
  return {
    root,
    dir: dirname(p),
    base: base || '',
    ext: extension,
    name: base ? base.slice(0, base.length - extension.length) : '',
  };
};

export default {
  normalize,
  join,
  resolve,
  isAbsolute,
  toNamespacedPath,
  extname,
  relative,
  dirname,
  format,
  basename,
  parse,
  normalizeString,
  normalizeWindowsPath,
  sep,
  delimiter,
};
