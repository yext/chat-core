import { Response as NodeResponse } from "node-fetch";

/**
 * Raw response from Chat API.
 *
 * @remarks
 * Response uses WHATWG ReadableStream API for browser environment
 * and NodeJS.ReadableStream API for node environment.
 *
 * @public
 */
export type RawResponse = Response | NodeResponse;
