import { ApiError } from "../models/http/ApiError";
import { ApiResponse } from "../models/http/ApiResponse";

/**
 * Determines whether or not an API response can be used to construct a chat response.
 *
 * @internal
 */
export class ApiResponseValidator {
  public static validate(
    apiResponse: ApiResponse,
    statusCode?: number
  ): ApiError | undefined {
    const tests = [
      this.validateResponseProp,
      this.validateMetaProp,
      this.checkForApiErrors,
    ];
    for (const test of tests) {
      const err = test(apiResponse, statusCode);
      if (err !== undefined) {
        return err;
      }
    }
  }

  private static validateResponseProp(
    apiResponse: ApiResponse,
    statusCode?: number
  ): ApiError | undefined {
    if (!apiResponse.response) {
      return new ApiError(
        "Malformed Chat API response: missing response property.",
        statusCode
      );
    }
  }

  private static validateMetaProp(
    apiResponse: ApiResponse,
    statusCode?: number
  ): ApiError | undefined {
    if (!apiResponse.meta) {
      return new ApiError(
        "Malformed Chat API response: missing meta property.",
        statusCode
      );
    }
  }

  private static checkForApiErrors(
    apiResponse: ApiResponse,
    statusCode?: number
  ): ApiError | undefined {
    if (apiResponse.meta?.errors?.length >= 1) {
      const error = apiResponse.meta.errors[0];
      return new ApiError(error.message, statusCode, error.code, error.type);
    }
  }
}
