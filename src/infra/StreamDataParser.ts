import { StreamEvent, StreamEventName } from "../models";

/**
 * Provides parsing functionality for stream data.
 *
 * @internal
 */
export class StreamDataParser {
  private eventName: string;
  private data: string;
  private decoder: TextDecoder;
  private NEWLINE_ASCII_CODE = 10;

  constructor() {
    this.eventName = "";
    this.data = "";
    this.decoder = new TextDecoder();
  }

  /**
   * Decodes raw data from stream and parses it into {@link StreamEvent}.
   * The expected format of raw data follows server-sent events (SSE) standard:
   * `event: startTokenStream\ndata: {"token": "Yext Chat"}\n\n`
   *
   * @param byteArray - data from stream
   * @param eventHander - function to invoke once a complete stream event is successfully parsed
   */
  public parse(
    byteArray: Buffer | Uint8Array,
    eventHander: (e: StreamEvent) => void
  ): void {
    let newLineIndex = -1;

    const appendData = (line: string) => {
      if (line.startsWith("data:")) {
        // Following EventSource API, multiple consecutive lines that begin with "data:"
        // will be concatenated, with a newline character between each one.
        const newData = line.replace(/^data: ?/, "");
        this.data = this.data == "" ? newData : `${this.data}\n${newData}`;
      } else {
        // Incomplete event data, should continue in next chunk
        this.data += line;
      }
    };

    byteArray.forEach((byte, i) => {
      if (byte !== this.NEWLINE_ASCII_CODE) {
        if (i == byteArray.length - 1) {
          // Data chunk not ending on pair of newlines indicates more data to come in the next
          // chunk for the same event. Save remaining data to continue process in next chunk
          appendData(this.decoder.decode(byteArray.subarray(newLineIndex + 1)));
        }
        return;
      }
      const prevNewLineIndex = newLineIndex;
      newLineIndex = i;
      // A pair of newline characters indicates end of an event stream
      if (prevNewLineIndex + 1 === newLineIndex) {
        const streamEvent = this.createStreamEvent(this.eventName, this.data);
        if (streamEvent) {
          eventHander(streamEvent);
        }
        this.eventName = "";
        this.data = "";
        return;
      }
      const line = this.decoder.decode(
        byteArray.subarray(prevNewLineIndex + 1, newLineIndex)
      );
      if (line.startsWith("event:")) {
        this.eventName = line.replace(/^event: ?/, "");
      } else {
        appendData(line);
      }
    });
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
}
