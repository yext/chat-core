import { ApiResponseValidator } from "../../src/validation/ApiResponseValidator";
import { ApiResponse } from "../../src/models/http/ApiResponse";
import { ApiError } from "../../src";
import { errorResponse } from "../mocks";

it("passes for a response with no errors", () => {
  const response = {
    response: {},
    meta: {
      uuid: "test",
      errors: [],
    },
  };
  const validationResponse = ApiResponseValidator.validate(response);
  expect(validationResponse).toBeUndefined();
});

it("fails for a response without a response property", () => {
  const response = {
    meta: {
      uuid: "test",
      errors: [],
    },
  } as unknown as ApiResponse;
  const validationResponse = ApiResponseValidator.validate(response);
  expect(validationResponse).toBeInstanceOf(ApiError);
  expect(validationResponse?.message).toEqual(
    "Malformed Chat API response: missing response property."
  );
});

it("fails for a response without a meta property", () => {
  const response = {
    response: {},
  } as ApiResponse;
  const validationResponse = ApiResponseValidator.validate(response);
  expect(validationResponse).toBeInstanceOf(ApiError);
  expect(validationResponse?.message).toEqual(
    "Malformed Chat API response: missing meta property."
  );
});

it("fails for a response with an API error", () => {
  const validationResponse = ApiResponseValidator.validate(errorResponse, 401);
  expect(validationResponse).toBeInstanceOf(ApiError);
  expect(validationResponse?.message).toEqual("Invalid API Key");
  expect(validationResponse?.statusCode).toEqual(401);
  expect(validationResponse?.apiCode).toEqual(1);
  expect(validationResponse?.type).toEqual("FATAL_ERROR");
});
