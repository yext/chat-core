import { EnumOrLiteral, StreamEvent, StreamEventName } from "../models";
import { RawResponse } from "../models/http/RawResponse";
import { StreamEventCallback } from "../models/endpoints/stream/StreamEventCallback";
import { ApiResponse } from "../models/http/ApiResponse";
import { ApiResponseValidator } from "../validation/ApiResponseValidator";
import { StreamDataParser } from "./StreamDataParser";

/**
 * Wrapper class around {@link RawResponse} that provides
 * an interface for working with Chat's streaming data in
 * both browser and Node environments.
 *
 * @public
 */
export class StreamResponse {
  /**
   * {@inheritdoc RawResponse}
   *
   * @public
   */
  readonly rawResponse: RawResponse;

  private streamDataParser: StreamDataParser;

  private isConsumed = false;
  private eventListeners: {
    [E in EnumOrLiteral<StreamEventName>]?: StreamEventCallback<E>[];
  } = {};

  constructor(rawResponse: RawResponse) {
    this.rawResponse = rawResponse;
    this.streamDataParser = new StreamDataParser();
  }

  /**
   * Registers a function that will be called whenever the specified stream event occurs.
   *
   * @public
   *
   * @param eventName - name of the event to listen
   * @param cb - callback function to invoke when event occurs
   */
  addEventListener<E extends EnumOrLiteral<StreamEventName>>(
    eventName: E,
    cb: StreamEventCallback<E>
  ) {
    const cbs = this.eventListeners[eventName];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    cbs ? cbs.push(cb) : (this.eventListeners[eventName] = [cb] as any);
  }

  /**
   * Reads data from a stream response and invokes callbacks from event
   * listeners for each chunk of data that is read.
   *
   * @remarks
   * Once the data has been consumed from the stream, this method will
   * simply return immediately on subsequent calls.
   *
   * @public
   */
  async consume(): Promise<void> {
    if (this.isConsumed) {
      console.error(
        "Stream Error: data has been consumed from the stream. Cannot be read again."
      );
      return;
    }
    const resBody = this.rawResponse.body;
    if (!resBody) {
      return Promise.reject('Response Error: "body" property is undefined.');
    }

    if (!this.rawResponse.ok) {
      const jsonResponse: ApiResponse = await this.rawResponse.json();
      const validationResult = ApiResponseValidator.validate(jsonResponse);
      return validationResult instanceof Error
        ? Promise.reject(validationResult)
        : Promise.reject(
            "An error occurred while processing request to Chat API."
          );
    }

    const streamCompleted =
      "getReader" in resBody
        ? this.consumeWebStream(resBody)
        : this.consumeNodeStream(resBody);
    this.isConsumed = true;
    return streamCompleted;
  }

  private async consumeWebStream(
    resBody: ReadableStream<Uint8Array>
  ): Promise<void> {
    const reader = resBody.getReader();
    let doneStreaming = false;
    do {
      const { value, done } = await reader.read();
      doneStreaming = done;
      if (!value) {
        continue;
      }
      this.streamDataParser.parse(value, (e) => this.handleEvent(e))
    } while (!doneStreaming);
  }

  private async consumeNodeStream(
    resBody: NodeJS.ReadableStream
  ): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      resBody.on("data", (chunk: Buffer) => {
        this.streamDataParser.parse(chunk, (e) => this.handleEvent(e))
      });
      resBody.on("error", (err) => {
        reject(err);
      });
      resBody.on("end", () => resolve());
    });
  }

  private handleEvent(event: StreamEvent) {
    this.eventListeners[event.event]?.forEach((cb) => {
      (cb as StreamEventCallback<typeof event.event>)(event);
    });
  }
}
