import "./modules/buffer";
import "./modules/test";
import "./modules/inspect";
import "./modules/assert";
import "./modules/_internal_";

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
   */
  isWindows(): boolean;

  /**
   * Checks if current operating system is MacOS.
   */
  isMacOS(): boolean;

  /**
   * Checks if current operating system is Linux.
   */
  isLinux(): boolean;
}

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
}

export {};
