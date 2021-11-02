export { SGRcomposer as default };
/**
 * A Class for composing various SGR codes.
 * @type {SGRcomposer}
 */
declare class SGRcomposer {
    /**
     * A Class for composing various SGR codes.
     * @param  {number|string} targetDepth - The target color depth.
     * @param  {style} styles              - Additional SGR style codes.
     */
    constructor(targetDepth: number | string, styles: any);
    _depth: any;
    colorSGR: any;
    /**
     * Set the current style
     * @param  {style | array} styles The desired styles as an object or array of keys.
     */
    set style(arg: any);
    /**
     * Get the current style object
     * @return {style} The currently set styles
     */
    get style(): any;
    /**
     * Get the current color depth.
     * @return {number} 0: no color, 1: 16 colors, 2: 256 colors, 3: 16m colors
     */
    get depth(): number;
    /**
     * Set the current color
     * @param  {number[]} color RGB as an array.
     */
    set color(arg: number[]);
    /**
     * Get the raw RGB color as an array.
     * @return {number[]} An array of RGB elements
     */
    get color(): number[];
    _color: any;
    /**
     * Get the raw color as a hex string.
     * @return {string} Color as hex string: #RRGGBB
     */
    get hex(): string;
    /**
     * Get the red component.
     * @return {number} Red component [0-255]
     */
    get red(): number;
    /**
     * Get the green component.
     * @return {number} Green component [0-255]
     */
    get green(): number;
    /**
     * Get the blue component.
     * @return {number} Blue component [0-255]
     */
    get blue(): number;
    styles: any;
    styleSGR: any;
    /**
     * Get the current style as an array of keys.
     * @return {string[]} An array of style keys.
     */
    get styleArray(): string[];
    /**
     * Render and SGRColor object.
     * @param  {object} exclusions - Styles to exclude from render.
     * @return {SGRColor} The rendered SGRColor object.
     */
    sgr(exclusions: object): any;
}
