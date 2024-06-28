import { TextDecoder, TextEncoder } from "util";

/**
 * jest's jsdom doesn't have the following properties defined in global for the DOM.
 * polyfill it with functions from NodeJS
 */
global.TextDecoder = TextDecoder;
global.TextEncoder = TextEncoder;
