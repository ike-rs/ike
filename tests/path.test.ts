// https://github.com/unjs/pathe/blob/main/test/index.spec.ts

import { describe, expect, it } from '@std/test';

runTest('normalize', Ike.path.normalize, {
  // POSIX
  '': '.',
  '/': '/',
  '/a/..': '/',
  './a/../': './',
  './a/..': '.',
  './': './',
  './../': '../',
  'happiness/ab/../': 'happiness/',
  'happiness/a./../': 'happiness/',
  './../dep/': '../dep/',
  'path//dep\\': 'path/dep/',
  '/foo/bar//baz/asdf/quux/..': '/foo/bar/baz/asdf',

  // Windows
  'C:\\': 'C:/',
  'C:\\temp\\..': 'C:/',
  'C:\\temp\\\\foo\\bar\\..\\': 'C:/temp/foo/',
  'C:////temp\\\\/\\/\\/foo/bar': 'C:/temp/foo/bar',
  'c:/windows/nodejs/path': 'C:/windows/nodejs/path',
  'c:/windows/../nodejs/path': 'C:/nodejs/path',

  'c:\\windows\\nodejs\\path': 'C:/windows/nodejs/path',
  'c:\\windows\\..\\nodejs\\path': 'C:/nodejs/path',

  '/windows\\unix/mixed': '/windows/unix/mixed',
  '\\windows//unix/mixed': '/windows/unix/mixed',
  '\\windows\\..\\unix/mixed/': '/unix/mixed/',
  './/windows\\unix/mixed/': 'windows/unix/mixed/',

  // UNC
  '\\\\server\\share\\file\\..\\path': '//server/share/path',
  '\\\\.\\c:\\temp\\file\\..\\path': '//./c:/temp/path',
  '\\\\server/share/file/../path': '//server/share/path',
  '\\\\C:\\foo\\bar': '//C:/foo/bar',
  '\\\\.\\foo\\bar': '//./foo/bar',
});

runTest('join', Ike.path.join, [
  ['.'],
  [undefined, '.'],
  ['/', '/path', '/path'],
  ['/test//', '//path', '/test/path'],
  ['some/nodejs/deep', '../path', 'some/nodejs/path'],
  ['./some/local/unix/', '../path', 'some/local/path'],
  ['./some\\current\\mixed', '..\\path', 'some/current/path'],
  ['../some/relative/destination', '..\\path', '../some/relative/path'],
  ['some/nodejs/deep', '../path', 'some/nodejs/path'],
  ['/foo', 'bar', 'baz/asdf', 'quux', '..', '/foo/bar/baz/asdf'],

  ['C:\\foo', 'bar', 'baz\\asdf', 'quux', '..', 'C:/foo/bar/baz/asdf'],
  ['some/nodejs\\windows', '../path', 'some/nodejs/path'],
  ['some\\windows\\only', '..\\path', 'some/windows/path'],
  // UNC paths
  ['\\\\server\\share\\file', '..\\path', '//server/share/path'],
  ['\\\\.\\c:\\temp\\file', '..\\path', '//./c:/temp/path'],
  ['\\\\server/share/file', '../path', '//server/share/path'],
]);

runTest('normalizeString', Ike.path.normalizeString, {
  // POSIX
  '/foo/bar': 'foo/bar',
  '/foo/bar/.././baz': 'foo/baz',
  '/foo/bar/../.well-known/baz': 'foo/.well-known/baz',
  '/foo/bar/../..well-known/baz': 'foo/..well-known/baz',
  '/a/../': '',
  '/a/./': 'a',
  './foobar/../a': 'a',
  './foo/be/bar/../ab/test': 'foo/be/ab/test',

  // Windows
  [Ike.path.normalizeWindowsPath('C:\\temp\\..')]: 'C:',
  [Ike.path.normalizeWindowsPath('C:\\temp\\..\\.\\Users')]: 'C:/Users',
  [Ike.path.normalizeWindowsPath('C:\\temp\\..\\.well-known\\Users')]:
    'C:/.well-known/Users',
  [Ike.path.normalizeWindowsPath('C:\\temp\\..\\..well-known\\Users')]:
    'C:/..well-known/Users',
  [Ike.path.normalizeWindowsPath('C:\\a\\..\\')]: 'C:',
  [Ike.path.normalizeWindowsPath('C:\\temp\\myfile.html')]:
    'C:/temp/myfile.html',
  [Ike.path.normalizeWindowsPath('\\temp\\myfile.html')]: 'temp/myfile.html',
  [Ike.path.normalizeWindowsPath('.\\myfile.html')]: 'myfile.html',
});

runTest('dirname', Ike.path.dirname, {
  // POSIX
  'test.html': '.',
  '/temp/': '/',
  '/temp/myfile.html': '/temp',
  './myfile.html': '.',

  // Windows
  'C:\\temp\\': 'C:/',
  'C:.\\temp\\': 'C:.',
  'C:.\\temp\\bar\\': 'C:./temp',
  'C:\\temp\\myfile.html': 'C:/temp',
  '\\temp\\myfile.html': '/temp',
  '.\\myfile.html': '.',
});

runTest('extname', Ike.path.extname, {
  // POSIX
  '/temp/myfile.html': '.html',
  './myfile.html': '.html',

  '.foo': '',
  '..foo': '.foo',
  'foo.123': '.123',
  '..': '',
  '.': '',
  './': '',

  // Windows
  'C:\\temp\\myfile.html': '.html',
  '\\temp\\myfile.html': '.html',
  '.\\myfile.html': '.html',
});

runTest('format', Ike.path.format, [
  // POSIX
  [
    { root: '/ignored', dir: '/home/user/dir', base: 'file.txt' },
    '/home/user/dir/file.txt',
  ],
  [{ root: '/', base: 'file.txt', ext: 'ignored' }, '/file.txt'],
  [{ root: '/', name: 'file', ext: '.txt' }, '/file.txt'],
  [{ name: 'file', ext: '.txt' }, 'file.txt'],

  // Windows
  [{ name: 'file', base: 'file.txt' }, 'file.txt'],
  [{ dir: 'C:\\path\\dir', base: 'file.txt' }, 'C:/path/dir/file.txt'],
]);

runTest('relative', Ike.path.relative, [
  // POSIX
  ['/data/orandea/test/aaa', '/data/orandea/impl/bbb', '../../impl/bbb'],
  ['/', '/foo/bar', 'foo/bar'],
  ['/foo', '/', '..'],
  [() => Ike.cwd(), './dist/client/b-scroll.d.ts', 'dist/client/b-scroll.d.ts'],

  // Windows
  ['C:\\orandea\\test\\aaa', 'C:\\orandea\\impl\\bbb', '../../impl/bbb'],
  ['C:\\orandea\\test\\aaa', 'c:\\orandea\\impl\\bbb', '../../impl/bbb'],
  ['C:\\', 'C:\\foo\\bar', 'foo/bar'],
  ['C:\\foo', 'C:\\', '..'],
  ['C:\\foo', 'd:\\bar', 'D:/bar'],
  [
    () => Ike.cwd().replace(/\\/g, '/'),
    './dist/client/b-scroll.d.ts',
    'dist/client/b-scroll.d.ts',
  ],
  [() => Ike.cwd(), './dist/client/b-scroll.d.ts', 'dist/client/b-scroll.d.ts'],
]);

runTest('resolve', Ike.path.resolve, [
  // POSIX
  ['/', '/path', '/path'],
  ['/', '', undefined, null, '', '/path', '/path'],
  ['/foo/bar', './baz', '/foo/bar/baz'],
  ['/foo/bar', './baz', undefined, null, '', '/foo/bar/baz'],
  ['/foo/bar', '..', '.', './baz', '/foo/baz'],
  ['/foo/bar', '/tmp/file/', '/tmp/file'],
  [
    'wwwroot',
    'static_files/png/',
    '../gif/image.gif',
    () => `${Ike.cwd().replace(/\\/g, '/')}/wwwroot/static_files/gif/image.gif`,
  ],

  // Windows
  ['C:\\foo\\bar', '.\\baz', 'C:/foo/bar/baz'],
  ['\\foo\\bar', '.\\baz', '/foo/bar/baz'],
  ['\\foo\\bar', '..', '.', '.\\baz', '/foo/baz'],
  ['\\foo\\bar', '\\tmp\\file\\', '/tmp/file'],
  ['\\foo\\bar', undefined, null, '', '\\tmp\\file\\', '/tmp/file'],
  [
    '\\foo\\bar',
    undefined,
    null,
    '',
    '\\tmp\\file\\',
    undefined,
    null,
    '',
    '/tmp/file',
  ],
  [
    'wwwroot',
    'static_files\\png\\',
    '..\\gif\\image.gif',
    () => `${Ike.cwd().replace(/\\/g, '/')}/wwwroot/static_files/gif/image.gif`,
  ],
  ['C:\\Windows\\path\\only', '../../reports', 'C:/Windows/reports'],
  [
    'C:\\Windows\\long\\path\\mixed/with/unix',
    '../..',
    '..\\../reports',
    'C:/Windows/long/reports',
  ],
]);

runTest('isAbsolute', Ike.path.isAbsolute, {
  // POSIX
  '/foo/bar': true,
  '/baz/..': true,
  'quax/': false,
  '.': false,

  // Windows
  'C:': false,
  'C:.': false,
  'C:/': true,
  'C:.\\temp\\': false,
  '//server': true,
  '\\\\server': true,
  'C:/foo/..': true,
  'bar\\baz': false,
  'bar/baz': false,
});

it('expect correct delimited on specific platform', () => {
  expect(Ike.path.delimiter).toBe(Ike.isWindows() ? ';' : ':');
});

it("expect separator to '/'", () => {
  expect(Ike.path.sep).toBe('/');
});

function _s(item: any) {
  return (JSON.stringify(_r(item)) || 'undefined').replace(/"/g, "'");
}

function _r(item: any) {
  return typeof item === 'function' ? item() : item;
}

export function runTest(name: string, function_: any, items: any) {
  if (!Array.isArray(items)) {
    items = Object.entries(items).map((e) => e.flat());
  }
  describe(`${name}`, () => {
    let cwd;
    for (const item of items) {
      const expected = item.pop();
      const arguments_ = item;
      it(`${name}(${arguments_.map((i: any) => _s(i)).join(',')}) should be ${_s(
        expected,
      )}`, () => {
        expect(function_(...arguments_.map((i: any) => _r(i)))).toBe(
          _r(expected),
        );
      });
      it(`${name}(${arguments_.map((i: any) => _s(i)).join(',')}) should be ${_s(
        expected,
      )} on Windows`, () => {
        cwd = Ike.cwd;
        Ike.cwd = () => 'C:\\Windows\\path\\only';
        expect(function_(...arguments_.map((i: any) => _r(i)))).toBe(
          _r(expected),
        );
        Ike.cwd = cwd;
      });
    }
  });
}
