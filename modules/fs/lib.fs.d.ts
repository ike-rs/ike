/**
 *     Files are resolved using current working directory
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
 */
declare module 'module:fs/fs.js' {
  type RemoveOptions = {
    /**
     * If set to true, path will be removed even if it's a non-empty directory.
     */
    recursive?: boolean;
  };

  type CreateDirOptions = {
    /**
     * If set to true, all parent directories will be created.
     */
    recursive?: boolean;
    /**
     * Mode to use when creating the directory. Defaults to 0o777.
     */
    mode?: number;
  };

  /**
   * Synchronously reads a file and returns entire content as array of bytes.
   *
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
  function readFileSync(path: string): Uint8Array;

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
  function readFile(path: string): Promise<Uint8Array>;

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
  function readTextFileSync(path: string): string;

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
  function readTextFile(path: string): Promise<string>;

  /**
   * Synchronously creates a new file or truncates an existing file.
   *
   * @param path
   * @returns void
   */
  function createFileSync(path: string): void;

  /**
   * Asynchronously creates a new file or truncates an existing file.
   *
   * @param path
   * @returns Promise<void>
   */
  function createFile(path: string): Promise<void>;

  /**
   * Synchronously creates a new directory.
   *
   * @param path Path to the directory
   * @param opts Options for creating the directory
   * @returns void
   */
  function createDirSync(path: string, opts?: CreateDirOptions): void;

  /**
   * Asynchronously creates a new directory.
   *
   * @param path Path to the directory
   * @param opts Options for creating the directory
   * @returns Promise<void>
   */
  function createDir(path: string, opts?: CreateDirOptions): Promise<void>;

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
  function removeSync(path: string, opts?: RemoveOptions): void;

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
  function remove(path: string, opts?: RemoveOptions): Promise<void>;

  /**
   * Synchronously checks if a path exists.
   *
   * @param path Path to the file or directory
   * @returns boolean
   */
  function existsSync(path: string): boolean;
}
