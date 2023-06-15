import { RawResponse, StreamEventName, StreamResponse } from "../../src";
import { Readable } from "stream";
import { ApiResponse } from "../../src/models/http/ApiResponse";

function mockResponse(rawData: string[]): RawResponse {
  return {
    ok: true,
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
    ok: true,
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
      data: {
        token: "this is ",
      },
    });
    expect(tokenEventCb).nthCalledWith(2, {
      event: StreamEventName.TokenStreamEvent,
      data: {
        token: "a test",
      },
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
    'event: streamToken\ndata: {"token": "this is "}\n\n',
    'event: streamToken\ndata: {"token": "a test"}\n\n',
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
    mockResponse(['event: streamToken\ndata: {"token": "test"}\n\n'])
  );
  const tokenEventCb = jest.fn();
  stream.addEventListener(StreamEventName.TokenStreamEvent, tokenEventCb);
  stream.addEventListener("streamToken", tokenEventCb);
  await stream.consume();
  expect(tokenEventCb).toBeCalledTimes(2);
});

it("handles multiple stream events in one message", async () => {
  const stream = new StreamResponse(
    mockResponse([
      'event: streamToken\ndata: {"token": "test"}\n\n' +
        'event: endStream\ndata: {"hello": "world"}\n\n',
    ])
  );
  const tokenEventCb = jest.fn();
  const endEventCb = jest.fn();
  stream.addEventListener(StreamEventName.TokenStreamEvent, tokenEventCb);
  stream.addEventListener(StreamEventName.EndEvent, endEventCb);
  await stream.consume();
  expect(tokenEventCb).toBeCalledTimes(1);
  expect(tokenEventCb).toBeCalledWith({
    event: StreamEventName.TokenStreamEvent,
    data: { token: "test" },
  });
  expect(endEventCb).toBeCalledTimes(1);
  expect(endEventCb).toBeCalledWith({
    event: StreamEventName.EndEvent,
    data: { hello: "world" },
  });
});

it("handles stream event split into multiple data chunks", async () => {
  const events = ['event: startTokenStream\ndata: {"foo": "b', "a", 'r"}\n\n'];
  const stream = new StreamResponse(mockResponse(events));
  const startEventCb = jest.fn();
  stream.addEventListener(StreamEventName.StartEvent, startEventCb);
  await stream.consume();
  expect(startEventCb).toBeCalledWith({
    event: StreamEventName.StartEvent,
    data: {
      foo: "bar",
    },
  });
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

it("log error on unnamed stream event", async () => {
  const errorSpy = jest.spyOn(console, "error").mockImplementation();
  const stream = new StreamResponse(mockResponse(["data: test\n\n"]));
  await stream.consume();
  expect(errorSpy).toBeCalledWith(
    "Stream Error: Unnamed event with following data:",
    "test"
  );
});

it("log error when attempt to read stream data multiple times", async () => {
  const errorSpy = jest.spyOn(console, "error").mockImplementation();
  const stream = new StreamResponse(
    mockResponse(['event: streamToken\\ndata: {"token": "test"}\\n\\n'])
  );
  await stream.consume();
  expect(errorSpy).not.toBeCalled();
  await stream.consume();
  expect(errorSpy).toBeCalledWith(
    "Stream Error: data has been consumed from the stream. Cannot be read again."
  );
});

it("rejects when response have a non-successful status code", async () => {
  const expectedResponse: ApiResponse = {
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
  const stream = new StreamResponse({
    ok: false,
    body: {},
    json: () => Promise.resolve(expectedResponse),
  } as unknown as RawResponse);
  await expect(stream.consume()).rejects.toThrow(
    "Chat API error: FATAL_ERROR: Invalid API Key. (code: 1)"
  );
});

it("rejects when error occurs while reading Web stream from response", async () => {
  const stream = new StreamResponse({
    ok: true,
    body: {
      getReader: () => {
        return {
          read() {
            throw Error("Unable to read data.");
          },
        };
      },
    },
  } as unknown as RawResponse);
  await expect(stream.consume()).rejects.toThrow("Unable to read data");
});

it("rejects when error occurs while reading Node stream from response", async () => {
  const stream = new StreamResponse({
    ok: true,
    body: new Readable({
      read() {
        throw Error("Unable to read data");
      },
    }),
  } as unknown as RawResponse);
  await expect(stream.consume()).rejects.toThrow("Unable to read data");
});
