import { RawResponse } from "../models/http/RawResponse";
import { QueryParams } from "../models/http/params";
import { fetch } from "./utils";

/**
 * Available HTTP request methods.
 */
enum RequestMethods {
  POST = "post",
}

/**
 * A service for HTTP Requests.
 *
 * @internal
 */
export interface HttpService {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  post<K extends Record<string, any>>(
    url: string,
    queryParams: QueryParams,
    body: K,
    apiKey: string
  ): Promise<RawResponse>;
}

/**
 * A concrete implementation of the HttpService interface
 *
 * @internal
 */
export class HttpServiceImpl implements HttpService {
  /**
   * Performs a POST request.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async post<K extends Record<string, any>>(
    url: string,
    queryParams: QueryParams,
    body: K,
    apiKey: string
  ): Promise<RawResponse> {
    const res = await fetch(url, queryParams, {
      method: RequestMethods.POST,
      body: JSON.stringify(body),
      mode: "cors",
      headers: {
        "Content-Type": "application/json",
        "api-key": apiKey,
      },
    });
    return res;
  }
}
