import { ApiResponseValidator } from '../src/validation/ApiResponseValidator';
import { ApiResponse } from '../src/models/http/ApiResponse';

const apiResponseValidator = new ApiResponseValidator();

it('passes for a response with no errors', () => {
  const response = {
    response: {},
    meta: {
      uuid: 'test',
      errors: []
    }
  };
  const validationResponse = apiResponseValidator.validate(response);
  expect(validationResponse).toBeUndefined();
});

it('fails for a response without a response property', () => {
  const response = {
    meta: {
      uuid: 'test',
      errors: []
    }
  } as unknown as ApiResponse;
  const validationResponse = apiResponseValidator.validate(response);
  expect(validationResponse).toBeInstanceOf(Error);
  expect(validationResponse?.message)
    .toEqual('Malformed Chat API response: missing response property.');
});

it('fails for a response without a meta property', () => {
  const response = {
    response: {}
  } as ApiResponse;
  const validationResponse = apiResponseValidator.validate(response);
  expect(validationResponse).toBeInstanceOf(Error);
  expect(validationResponse?.message)
    .toEqual('Malformed Chat API response: missing meta property.');
});

it('fails for a response with an API error', () => {
  const response: ApiResponse = {
    response: {},
    meta: {
      uuid: 'test',
      errors: [
        {
          message: 'Invalid API Key',
          code: 1,
          type: 'FATAL_ERROR'
        }
      ]
    }
  };
  const validationResponse = apiResponseValidator.validate(response);
  expect(validationResponse).toBeInstanceOf(Error);
  expect(validationResponse?.message)
    .toEqual('Chat API error: FATAL_ERROR: Invalid API Key. (code: 1)');
});