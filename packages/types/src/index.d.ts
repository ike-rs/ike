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
