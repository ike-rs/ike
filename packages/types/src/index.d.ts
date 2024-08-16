/// <reference path="./globals.d.ts" />

import './modules/buffer';
import './modules/test';
import './modules/inspect';
import './modules/assert';
import './modules/_internal_';
import './modules/format';
import { URL as _URL, URLSearchParams as _URLSearchParams } from './url';
import type { Console } from './console';
import type { Headers as _Headers } from './headers';
import type Path from './modules/path';
import {
  ReadableStream as _ReadableStream,
  ReadableStreamDefaultController as _ReadableStreamDefaultController,
  ReadableByteStreamController as _ReadableByteStreamController,
  ReadableStreamBYOBRequest as _ReadableStreamBYOBRequest,
  ReadableStreamDefaultReader as _ReadableStreamDefaultReader,
  ReadableStreamBYOBReader as _ReadableStreamBYOBReader,
  WritableStream as _WritableStream,
  WritableStreamDefaultController as _WritableStreamDefaultController,
  WritableStreamDefaultWriter as _WritableStreamDefaultWriter,
  ByteLengthQueuingStrategy as _ByteLengthQueuingStrategy,
  CountQueuingStrategy as _CountQueuingStrategy,
  TransformStream as _TransformStream,
  TransformStreamDefaultController as _TransformStreamDefaultController,
} from './modules/streams';

/**
 * The Meta interface contains information about the current file and its paths.
 */
interface Meta {
  /**
   * The name of the current file, e.g., index.ts.
   * @example 'index.ts'
   */
  file: string;
  /**
   * The absolute path to the current file.
   * @example '/user/project/src/index.ts'
   */
  path: string;
  /**
   * An alias for `path`. Contains the same value as `path`.
   * @example '/user/project/src/index.ts'
   */
  filename: string;
  /**
   * The absolute path to the directory containing the current file.
   * @example '/user/project/src'
   */
  dir: string;
  /**
   * An alias for `dir`. Contains the same value as `dir`.
   * @example '/user/project/src'
   */
  dirname: string;
}

type Os =
  | 'linux'
  | 'macos'
  | 'ios'
  | 'freebsd'
  | 'dragonfly'
  | 'netbsd'
  | 'openbsd'
  | 'solaris'
  | 'android'
  | 'windows';

type RemoveOptions = {
  /**
   * If set to true, path will be removed even if it's a non-empty directory.
   */
  recursive?: boolean;
};

interface Ike {
  /**
   * Provides information for the module about itself.
   */
  meta: Meta;

  /**
   * Exit the process with optional exit code.
   *
   * @param code Exit code.
   * @returns void
   */
  exit(code?: number): never;

  /**
   * Set an exit code for the process.
   *
   * @param code Exit code.
   * @returns void
   * @throws Error if the code is not a number or no arguments are provided.
   */
  setExitCode(code: number): void;

  /**
   * Global exit code
   *
   * @default 0
   * @returns number
   */
  exitCode: number;

  /**
   * Returns group ID of the process.
   *
   * Only available on Unix platforms. Returns null on Windows.
   */
  gid(): number | null;

  /**
   * Returns process ID of the process.
   */
  pid: number;

  /**
   * Returns user ID of the process.
   *
   * Only available on Unix platforms. Returns null on Windows.
   */
  uid(): number | null;

  /**
   * Checks if current operating system is Windows.
   *
   * @returns boolean
   */
  isWindows(): boolean;

  /**
   * Checks if current operating system is macOS.
   *
   * @returns boolean
   */
  isMacOS(): boolean;

  /**
   * Checks if current operating system is Linux.
   *
   * @returns boolean
   */
  isLinux(): boolean;

  /**
   * Returns the current working directory.
   *
   * @returns string
   */
  cwd(): string;

  /**
   * Returns the name of the current operating system.
   *
   * @example 'linux'
   */
  os: Os;

  /**
   * Returns the version of the Ike runtime.
   *
   * @example '0.1.0'
   */
  version: string;

  /**
   * Takes a string and parses it as TOML.
   *
   * @param tomlString TOML string to parse
   * @returns unknown
   */
  parseToml(tomlString: string): any;

  /**
   * Synchronously reads a file and returns entire content as array of bytes.
   *
   * Files are resolved using current working directory
   *
   * Let's say we have this structure:
   * - src
   *   - index.ts
   *   - file.txt
   *
   *  And we are running the script from parent directory:
   *  `ike run src/index.ts`:
   *  ```ts
   *  const content = Ike.readFileSync("file.txt");
   *  ```
   *
   *  This will result in error because path will be resolved as `{cwd}/file.txt` which is not correct.
   *
   *  @example
   *  ```ts
   *  const content = Ike.readFileSync("file.txt");
   *  console.log(new TextDecoder().decode(content));
   *  ```
   *
   * @param path Path to the file
   * @returns Uint8Array Content of the file as array of bytes
   */
  readFileSync(path: string): Uint8Array;

  /**
   * Asynchronously reads a file and returns entire content as array of bytes.
   *
   * @example
   * ```ts
   * const content = await Ike.readFile("file.txt");
   * console.log(new TextDecoder().decode(content));
   * ```
   *
   * @param path Path to the file
   * @returns Promise<Uint8Array> Content of the file as array of bytes
   */
  readFile(path: string): Promise<Uint8Array>;

  /**
   * Synchronously reads a file and returns entire content as string.
   *
   *  @example
   *  ```ts
   *  const content = Ike.readFileSync("file.txt");
   *  console.log(content);
   *  ```
   *
   * @param path Path to the file
   * @returns string Content of the file as string
   */
  readTextFileSync(path: string): string;

  /**
   * Asynchronously reads a file and returns entire content as string
   *
   * @example
   * ```ts
   * const content = await Ike.readFile("file.txt");
   *
   * console.log(content);
   * ```
   *
   * @param path Path to the file
   * @returns Promise<string> Content of the file as string
   */
  readTextFile(path: string): Promise<string>;

  /**
   * Synchronously creates a new file or truncates an existing file.
   *
   * @param path
   * @returns void
   */
  createFileSync(path: string): void;

  /**
   * Synchronously creates a new directory.
   *
   * @param path Path to the directory
   * @param opts Options for creating the directory
   * @returns void
   */
  createDirSync(
    path: string,
    opts?: {
      /**
       * If set to true, all parent directories will be created.
       */
      recursive?: boolean;
    },
  ): void;

  /**
   * Synchronously removes a file or directory.
   *
   * @example
   * ```ts
   * Ike.removeSync("file.txt");
   * Ike.removeSync("dir/path", { recursive: true });
   * ```
   *
   * @param path Path to the directory or file
   * @param opts Options for removing the directory
   * @returns void
   * @throws Error if path does not exist, permission is denied or path is non-empty directory and `recursive` is not set to true.
   */
  removeSync(path: string, opts?: RemoveOptions): void;

  /**
   * Asynchronously removes a file or directory.
   *
   * @example
   * ```ts
   * await Ike.remove("file.txt");
   * await Ike.remove("dir/path", { recursive: true });
   * ```
   *
   * @param path Path to the directory or file
   * @param opts Options for removing the directory
   * @returns Promise<void>
   * @throws Error if path does not exist, permission is denied or path is non-empty directory and `recursive` is not set to true.
   */
  remove(path: string, opts?: RemoveOptions): Promise<void>;

  /**
   * Synchronously checks if a path exists.
   *
   * @param path Path to the file or directory
   * @returns boolean
   */
  existsSync(path: string): boolean;

  /**
   * Returns path to the executable.
   *
   * @returns string
   */
  which(
    executable: string,
    opts?: {
      /**
       * Current working directory.
       */
      cwd?: string;
      path?: string;
    },
  ): string | null;

  /**
   * Utilities for working with paths.
   *
   * @example
   * ```ts
   * console.log(Ike.path.join("path", "to", "file.txt"));
   * ```
   *
   * Can be also used as a module
   *
   * @example
   * ```ts
   * import { join } from "path";
   * console.log(join("path", "to", "file.txt"));
   * ```
   *
   */
  path: Path;

  /**
   * Environment variables.
   *
   * @example
   * ```ts
   * console.log(Ike.env.Path);
   * ```
   */
  env: Record<string, string>;

  /**
   * Transpile TypeScript code to JavaScript.
   *
   * @param loader - Loader type
   * @param source - Source code
   * @param inject - Inject runtime helpers
   * @returns string
   */
  transpile(loader: Loader, sourceText: string, inject?: boolean): string;
}

type Loader = 'js' | 'mjs' | 'ts' | 'mts' | 'cjs' | 'cts' | 'jsx' | 'tsx';

declare namespace Ike {
  const meta: Meta;
}

declare global {
  const Ike: Ike;

  /**
   * Function allows to call internal rust functions.
   *
   * @internal
   */
  function $rustFunction(name: string): Function;

  /**
   * The global `console` object provides access to the console, enabling methods for logging,
   * informational output, and error reporting.
   */
  const console: Console;

  /**
   * The `setTimeout()` function sets a timer which executes a function or specified piece of code once the timer expires.
   *
   * @param callback - The function to execute.
   * @param ms - The number of milliseconds to wait before executing the code.
   * @param args - Additional arguments to pass to the function.
   */
  function setTimeout(
    callback: (...args: any[]) => void,
    ms: number,
    ...args: any[]
  ): number;

  /**
   * The `clearTimeout()` function cancels a timeout previously established by calling `setTimeout()`.
   *
   * @param id - The identifier of the timeout you want to cancel.
   */
  function clearTimeout(id: number): void;
}

export {};
