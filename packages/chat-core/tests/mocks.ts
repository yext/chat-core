import { ApiResponse } from "../src/models/http/ApiResponse";

export const errorResponse: ApiResponse = {
  response: {},
  meta: {
    uuid: "test",
    errors: [
      {
        message: "Invalid API Key",
        code: 1,
        type: "FATAL_ERROR",
      },
    ],
  },
};
