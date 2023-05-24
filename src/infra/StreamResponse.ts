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
      const streamEvents = this.parseStreamData(value);
      streamEvents.forEach((event) => this.handleEvent(event));
    } while (!doneStreaming);
  }

  private async consumeNodeStream(
    resBody: NodeJS.ReadableStream
  ): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      resBody.on("data", (chunk: Buffer) => {
        const streamEvents = this.parseStreamData(chunk);
        streamEvents.forEach((event) => this.handleEvent(event));
      });
      resBody.on("error", (err) => {
        reject(err);
      });
      resBody.on("end", () => resolve());
    });
  }

  /**
   * Decodes raw data from stream and parses it into an array of {@link StreamEvent}.
   * The expected format of raw data follows server-sent events (SSE) standard:
   * `event: startTokenStream\ndata: {"token": "Yext Chat"}\n\n`
   *
   * @internal
   *
   * @param byteArray - data from stream
   * @returns an array of {@link StreamEvent} or undefined if it doesn't have expected format or event type
   */
  private parseStreamData(byteArray: Buffer | Uint8Array): StreamEvent[] {
    let eventName = "";
    let data = "";
    let newLineIndex = -1;
    const NEWLINE_ASCII_CODE = 10;
    const streamEvents: StreamEvent[] = [];
    const decoder = new TextDecoder();
    byteArray.forEach((byte, i) => {
      if (byte !== NEWLINE_ASCII_CODE) {
        return;
      }
      const prevNewLineIndex = newLineIndex;
      newLineIndex = i;
      // A pair of newline characters indicates end of an event stream
      if (prevNewLineIndex + 1 === newLineIndex) {
        const streamEvent = this.createStreamEvent(eventName, data);
        if (streamEvent) {
          streamEvents.push(streamEvent);
        }
        eventName = "";
        data = "";
        return;
      }
      const line = decoder.decode(
        byteArray.subarray(prevNewLineIndex + 1, newLineIndex)
      );
      if (line.startsWith("event:")) {
        eventName = line.replace(/^event: ?/, "");
      } else if (line.startsWith("data:")) {
        // Following EventSource API, multiple consecutive lines that begin with "data:"
        // will be concatenated, with a newline character between each one.
        const newData = line.replace(/^data: ?/, "");
        data = data == "" ? newData : `${data}\n${newData}`;
      }
    });
    return streamEvents;
  }

  private createStreamEvent(
    eventName: string,
    data: string
  ): StreamEvent | undefined {
    if (!eventName) {
      console.error("Stream Error: Unnamed event with following data:", data);
    } else {
      switch (eventName) {
        case StreamEventName.StartEvent:
        case StreamEventName.TokenStreamEvent:
        case StreamEventName.EndEvent:
          return { event: eventName, data: JSON.parse(data) };
        default:
          console.error(
            `Stream Error: Unknown Event "${eventName}" with data: ${data}`
          );
      }
    }
  }

  private handleEvent(event: StreamEvent) {
    this.eventListeners[event.event]?.forEach((cb) => {
      (cb as StreamEventCallback<typeof event.event>)(event);
    });
  }
}
