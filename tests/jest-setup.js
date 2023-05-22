import { TextDecoder, TextEncoder } from 'util';

/**
 * jest's jsdom doesn't have the following properties defined in global for the DOM.
 * polyfill it with decoder from NodeJS
 */
global.TextDecoder = TextDecoder;
global.TextEncoder = TextEncoder