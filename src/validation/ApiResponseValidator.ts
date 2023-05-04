import { ApiResponse } from '../models/http/ApiResponse';

/**
 * Determines whether or not an API response can be used to construct a chat response.
 *
 * @internal
 */
export class ApiResponseValidator {

  public validate(apiResponse: ApiResponse): Error | undefined {
    const tests = [
      this.validateResponseProp,
      this.validateMetaProp,
      this.checkForApiErrors
    ];
    for (const test of tests) {
      const err = test(apiResponse);
      if (err !== undefined) {
        return err;
      }
    }
  }

  private validateResponseProp(apiResponse: ApiResponse): Error | undefined {
    if (!apiResponse.response) {
      return new Error('Malformed Chat API response: missing response property.');
    }
  }

  private validateMetaProp(apiResponse: ApiResponse): Error | undefined {
    if (!apiResponse.meta) {
      return new Error('Malformed Chat API response: missing meta property.');
    }
  }

  private checkForApiErrors(apiResponse: ApiResponse): Error | undefined {
    if (apiResponse.meta?.errors?.length >= 1) {
      const error = apiResponse.meta.errors[0];
      const { code, message, type } = error;
      return new Error(`Chat API error: ${type}: ${message}. (code: ${code})`);
    }
  }
}