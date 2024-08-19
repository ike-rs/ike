declare global {
  /**
   * Interface representing the Console object with methods for outputting messages to the console.
   */
  export declare interface Console {
    /**
     * Logs a message to the console.
     *
     * @param {...any} data - The data to be logged to the console.
     */
    log(...data: any): void;

    /**
     * Outputs informational messages to the console.
     *
     * @param {...any} data - The informational data to be displayed.
     */
    info(...data: any): void;

    /**
     * Outputs error messages to the console.
     *
     * @param {...any} data - The error data to be displayed.
     */
    error(...data: any): void;
  }

  /**
   * The global `console` object provides access to the console, enabling methods for logging,
   * informational output, and error reporting.
   */
  const console: Console;
}

export {};
