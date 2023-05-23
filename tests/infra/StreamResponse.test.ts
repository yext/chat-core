import { RawResponse, StreamEventName, StreamResponse } from "../../src";
import { Readable } from "stream";

function mockResponse(rawData: string[]): RawResponse {
  return {
    body: {
      getReader: () => {
        let i = -1;
        return {
          read() {
            i++;
            return i === rawData.length
              ? Promise.resolve({ done: true })
              : Promise.resolve({
                  value: new TextEncoder().encode(rawData[i]),
                });
          },
        };
      },
    },
  } as RawResponse;
}

function mockNodeResponse(rawData: string[]): RawResponse {
  return {
    body: new Readable({
      read() {
        rawData.forEach((d) => this.push(d));
        this.push(null);
      },
    }),
  } as unknown as RawResponse;
}

describe("process data from stream with event listeners as expected", () => {
  async function testStream(rawResponse: RawResponse) {
    const stream = new StreamResponse(rawResponse);
    const startEventCb = jest.fn();
    const tokenEventCb = jest.fn();
    const endEventCb = jest.fn();
    stream.addEventListener(StreamEventName.StartEvent, startEventCb);
    stream.addEventListener(StreamEventName.TokenStreamEvent, tokenEventCb);
    stream.addEventListener(StreamEventName.EndEvent, endEventCb);
    await stream.consume();

    expect(startEventCb).toBeCalledTimes(1);
    expect(startEventCb).toBeCalledWith({
      event: StreamEventName.StartEvent,
      data: {
        foo: "bar",
      },
    });
    expect(tokenEventCb).toBeCalledTimes(2);
    expect(tokenEventCb).nthCalledWith(1, {
      event: StreamEventName.TokenStreamEvent,
      data: "this is ",
    });
    expect(tokenEventCb).nthCalledWith(2, {
      event: StreamEventName.TokenStreamEvent,
      data: "a test",
    });
    expect(endEventCb).toBeCalledTimes(1);
    expect(endEventCb).toBeCalledWith({
      event: StreamEventName.EndEvent,
      data: {
        hello: "world",
      },
    });
  }

  const events = [
    'event: startTokenStream\ndata: {"foo": "bar"}\n\n',
    "event: streamToken\ndata: this is \n\n",
    "event: streamToken\ndata: a test\n\n",
    'event: endStream\ndata: {"hello": "world"}\n\n',
  ];
  it("works as expected with Web Stream API", async () => {
    const rawResponse = mockResponse(events);
    await testStream(rawResponse);
  });

  it("works as expected with NodeJS Stream API", async () => {
    const rawResponse = mockNodeResponse(events);
    await testStream(rawResponse);
  });
});

it("allows for enum or string to register for the same event", async () => {
  const stream = new StreamResponse(
    mockResponse(["event: streamToken\ndata: test \n\n"])
  );
  const tokenEventCb = jest.fn();
  stream.addEventListener(StreamEventName.TokenStreamEvent, tokenEventCb);
  stream.addEventListener("streamToken", tokenEventCb);
  await stream.consume();
  expect(tokenEventCb).toBeCalledTimes(2);
});

it("log error on unknown stream event", async () => {
  const errorSpy = jest.spyOn(console, "error").mockImplementation();
  const stream = new StreamResponse(
    mockResponse(["event: someRandomEvent\ndata: test\n\n"])
  );
  await stream.consume();
  expect(errorSpy).toBeCalledWith(
    'Stream Error: Unknown Event "someRandomEvent" with data: test'
  );
});

it("log error on unknown stream data", async () => {
  const errorSpy = jest.spyOn(console, "error").mockImplementation();
  const stream = new StreamResponse(
    mockResponse(["name: test\ninfo: mock\n\n"])
  );
  await stream.consume();
  expect(errorSpy).toBeCalledWith(
    "Stream Error: Unknown data:",
    "name: test\ninfo: mock\n\n"
  );
});

it("log error when attempt to read stream data multiple times", async () => {
  const errorSpy = jest.spyOn(console, "error").mockImplementation();
  const stream = new StreamResponse(
    mockResponse(["event: streamToken\ndata: test\n\n"])
  );
  await stream.consume();
  expect(errorSpy).not.toBeCalled();
  await stream.consume();
  expect(errorSpy).toBeCalledWith(
    "Stream Error: data has been consumed from the stream. Cannot be read again."
  );
});
