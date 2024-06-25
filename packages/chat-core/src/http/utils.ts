import { QueryParams, SanitizedQueryParams } from "../models/http/params";
import crossFetch from "cross-fetch";

/**
 * Performs a fetch, using the polyfill if needed.
 *
 * @internal
 */
export function fetch(
  url: string,
  queryParams: QueryParams,
  reqInit: RequestInit
): Promise<Response> {
  const urlWithParams = addParamsToURL(url, queryParams);
  if (typeof window !== "undefined" && window.fetch) {
    return window.fetch(urlWithParams, reqInit);
  }
  return crossFetch(urlWithParams, reqInit);
}

/**
 * Removes params with undefined or null values.
 *
 * @internal
 */
export function sanitizeQueryParams(params: QueryParams): SanitizedQueryParams {
  Object.keys(params).forEach((key) => {
    if (params[key] === undefined || params[key] === null) {
      delete params[key];
    }
  });

  return params as SanitizedQueryParams;
}

/**
 * Updates a url with the given params.
 *
 * @internal
 */
export function addParamsToURL(url: string, params: QueryParams): string {
  const parsedUrl = new URL(url);
  const sanitizedParams: SanitizedQueryParams = sanitizeQueryParams(params);

  Object.entries(sanitizedParams).forEach(([k, v]) => {
    parsedUrl.searchParams.append(k, v.toString());
  });
  return parsedUrl.toString();
}
