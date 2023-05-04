import { ApiResponse } from '../models/http/ApiResponse';
import { QueryParams } from '../models/http/params';
import { fetch } from './utils';

/**
 * Available HTTP request methods.
 */
enum RequestMethods {
  POST = 'post',
}

/**
 * A service for HTTP Requests.
 *
 * @internal
 */
export class HttpService {

  /**
   * Performs a POST request.
   */
  async post<T = ApiResponse, K extends Record<string, any> = Record<string, any>>(
    url: string,
    queryParams: QueryParams,
    body: K,
    apiKey: string
  ): Promise<T> {
    const res = await fetch(url, queryParams, {
      method: RequestMethods.POST,
      body: JSON.stringify(body),
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json',
        'api-key': apiKey,
      }
    });
    return await res.json();
  }
}
