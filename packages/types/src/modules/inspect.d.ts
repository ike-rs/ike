declare module 'inspect' {
  /**
   * Options for customizing the inspection of an object.
   */
  interface InspectOptions {
    /**
     * Whether to show hidden (non-enumerable) properties.
     */
    showHidden?: boolean;

    /**
     * The number of times to recurse while formatting the object.
     */
    depth?: number;

    /**
     * Whether to use colors in the output.
     */
    colors?: boolean;

    /**
     * Whether to call custom inspect functions on the objects.
     */
    customInspect?: boolean;

    /**
     * Any other options.
     */
    [key: string]: any;
  }

  type InspectColorCode = [number, number];

  interface InspectColors {
    bold: InspectColorCode;
    italic: InspectColorCode;
    underline: InspectColorCode;
    inverse: InspectColorCode;
    white: InspectColorCode;
    grey: InspectColorCode;
    black: InspectColorCode;
    blue: InspectColorCode;
    cyan: InspectColorCode;
    green: InspectColorCode;
    magenta: InspectColorCode;
    red: InspectColorCode;
    yellow: InspectColorCode;
  }

  interface InspectStyles {
    special: string;
    number: string;
    boolean: string;
    undefined: string;
    null: string;
    string: string;
    date: string;
    regexp: string;
  }

  /**
   * Inspects an object and returns a string representation.
   * @param {*} obj - Any JavaScript primitive or Object
   * @param {InspectOptions} [opts] - Options for customizing the inspection.
   * @returns {string} The string representation of the object.
   */
  export const inspect: {
    (obj: any, opts?: InspectOptions): string;
    colors: InspectColors;
    styles: InspectStyles;
  };
}
