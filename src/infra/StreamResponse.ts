import { EnumOrLiteral, StreamEvent, StreamEventName } from "../models";
import { RawResponse } from "../models/http/RawResponse";
import { StreamEventCallback } from "../models/endpoints/stream/StreamEventCallback";

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

  private isConsumed = false;
  private eventListeners: {
    [E in EnumOrLiteral<StreamEventName>]?: StreamEventCallback<E>[];
  } = {};

  constructor(rawResponse: RawResponse) {
    this.rawResponse = rawResponse;
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
      return;
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
      const streamEvent = this.parseStreamData(value);
      if (!streamEvent) {
        continue;
      }
      this.handleEvent(streamEvent);
    } while (!doneStreaming);
  }

  private async consumeNodeStream(
    resBody: NodeJS.ReadableStream
  ): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      resBody.on("data", (chunk: Buffer) => {
        const streamEvent = this.parseStreamData(chunk);
        if (streamEvent) {
          this.handleEvent(streamEvent);
        }
      });
      resBody.on("error", (err) => {
        reject(err);
      });
      resBody.on("end", () => resolve());
    });
  }

  /**
   * Decodes raw data from stream into a string and parses it into a {@link StreamEvent}.
   * The expected format of raw data follows server-sent events (SSE) standard:
   * `event: startTokenStream\ndata: Yext Chat\n\n`
   *
   * @internal
   *
   * @param rawData - data from stream
   * @returns a {@link StreamEvent} or undefined if it doesn't have expected format or event type
   */
  private parseStreamData(rawData: BufferSource): StreamEvent | undefined {
    const decodedData = new TextDecoder().decode(rawData);
    const match = decodedData.match(/^event:\s*(.+)\n*data:\s*(.+\s*)\n\n/);
    if (!match) {
      console.error("Stream Error: Unknown data:", decodedData);
      return;
    }
    const event = match[1];
    const dataStr = match[2];
    switch (event) {
      case StreamEventName.StartEvent:
      case StreamEventName.EndEvent:
        const data = JSON.parse(dataStr);
        return { event, data };
      case StreamEventName.TokenStreamEvent:
        return { event, data: dataStr };
      default:
        console.error(
          `Stream Error: Unknown Event "${event}" with data: ${dataStr}`
        );
        return;
    }
  }

  private handleEvent(event: StreamEvent) {
    this.eventListeners[event.event]?.forEach((cb) => {
      (cb as StreamEventCallback<typeof event.event>)(event);
    });
  }
}
