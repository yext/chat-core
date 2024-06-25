/**
 * Represents an API error
 *
 * @remarks
 * If the error originates from the Chat API, the code and type property will be present.
 *
 * @public
 */
export class ApiError extends Error {
  /** The error message. */
  public message: string;

  /** The request status code */
  public statusCode?: number;
  /** The internal API error code. */
  public apiCode?: number;
  /** The internal API error type. */
  public type?: string;

  /** @internal */
  constructor(
    message: string,
    statusCode?: number,
    apiCode?: number,
    type?: string
  ) {
    super(message);

    this.statusCode = statusCode;
    this.message = message;
    this.apiCode = apiCode;
    this.type = type;
  }
}
