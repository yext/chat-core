import {
  ChatConfig,
  MessageRequest,
  MessageResponse,
  MessageSource,
  ProvideChatCore,
} from "../src";
import { defaultApiVersion } from "../src/constants";
import { HttpServiceImpl } from "../src/http/HttpService";

const mockedMessageRequest: MessageRequest = {
  conversationId: "my-id",
  context: {
    foo: "bar",
  },
  messages: [],
  promptPackage: "stable",
};

const defaultConfig: ChatConfig = {
  botId: "my-bot",
  apiKey: "my-api-key",
};

function mockHttpPost(
  expectedResponse: unknown = { response: {}, meta: {} },
  ok = true
): jest.SpyInstance {
  return jest.spyOn(HttpServiceImpl.prototype, "post").mockResolvedValue({
    ok,
    json: () => Promise.resolve(expectedResponse),
  } as Response);
}

it("returns message response on successful API response", async () => {
  const expectedMessageResponse: MessageResponse = {
    conversationId: "someId",
    message: {
      responseId: "someULID",
      text: "hello world!",
      source: MessageSource.BOT,
      timestamp: "2023-05-15T17:33:38.373Z",
    },
    notes: {
      currentGoal: "test!",
    },
  };
  mockHttpPost({
    response: expectedMessageResponse,
    meta: {},
  });
  const chatCore = ProvideChatCore({
    botId: "my-bot",
    apiKey: "my-api-key",
    version: "STAGING",
    env: "PRODUCTION",
    region: "US",
    businessId: 1234567,
  });
  const res = await chatCore.getNextMessage(mockedMessageRequest);
  expect(res).toEqual(expectedMessageResponse);
});

it("returns rejected promise on a failed API response", async () => {
  mockHttpPost(
    {
      response: {},
      meta: {
        errors: [
          {
            message: "Invalid API Key",
            code: 1,
            type: "FATAL_ERROR",
          },
        ],
      },
    },
    false
  );
  const chatCore = ProvideChatCore(defaultConfig);
  await expect(
    chatCore.getNextMessage(mockedMessageRequest)
  ).rejects.toThrowError(
    "Chat API error: FATAL_ERROR: Invalid API Key. (code: 1)"
  );
});

describe("URL and http request construction", () => {
  it("sets default endpoint and businessId when not specified for Chat API", async () => {
    const httpServiceSpy = mockHttpPost();
    const chatCore = ProvideChatCore(defaultConfig);
    await chatCore.getNextMessage(mockedMessageRequest);
    expect(httpServiceSpy).toHaveBeenCalledWith(
      "https://liveapi.yext.com/v2/accounts/me/chat/my-bot/message",
      { v: defaultApiVersion },
      mockedMessageRequest,
      "my-api-key"
    );
  });

  it("sets default endpoint and businessId when not specified for Chat Stream API", async () => {
    const httpServiceSpy = mockHttpPost();
    const chatCore = ProvideChatCore(defaultConfig);
    await chatCore.streamNextMessage(mockedMessageRequest);
    expect(httpServiceSpy).toHaveBeenCalledWith(
      "https://liveapi.yext.com/v2/accounts/me/chat/my-bot/message/streaming",
      { v: defaultApiVersion },
      mockedMessageRequest,
      "my-api-key"
    );
  });

  const configWithEndpoints: ChatConfig = {
    ...defaultConfig,
    endpoints: {
      chat: "https://my-custom-domain.com/",
      chatStream: "https://my-custom-stream-domain.com/",
    },
  };

  it("sets custom endpoints when specified for Chat API", async () => {
    const httpServiceSpy = mockHttpPost();
    const chatCore = ProvideChatCore(configWithEndpoints);
    await chatCore.getNextMessage(mockedMessageRequest);
    expect(httpServiceSpy).toHaveBeenCalledWith(
      "https://my-custom-domain.com/",
      { v: defaultApiVersion },
      {
        conversationId: "my-id",
        context: {
          foo: "bar",
        },
        messages: [],
        promptPackage: "stable",
      },
      "my-api-key"
    );
  });

  it("sets custom endpoints when specified for Chat Stream API", async () => {
    const httpServiceSpy = mockHttpPost();
    const chatCore = ProvideChatCore(configWithEndpoints);
    await chatCore.streamNextMessage(mockedMessageRequest);
    expect(httpServiceSpy).toHaveBeenCalledWith(
      "https://my-custom-stream-domain.com/",
      { v: defaultApiVersion },
      {
        conversationId: "my-id",
        context: {
          foo: "bar",
        },
        messages: [],
        promptPackage: "stable",
      },
      "my-api-key"
    );
  });

  const configWithVersion: ChatConfig = {
    ...defaultConfig,
    version: 42,
  };

  it("sets custom version when specified for Chat API", async () => {
    const httpServiceSpy = mockHttpPost();
    const chatCore = ProvideChatCore(configWithVersion);
    await chatCore.getNextMessage(mockedMessageRequest);
    expect(httpServiceSpy).toHaveBeenCalledWith(
      "https://liveapi.yext.com/v2/accounts/me/chat/my-bot/message",
      { v: defaultApiVersion },
      {
        version: 42,
        conversationId: "my-id",
        context: {
          foo: "bar",
        },
        messages: [],
        promptPackage: "stable",
      },
      "my-api-key"
    );
  });

  it("sets custom version when specified for Chat Stream API", async () => {
    const httpServiceSpy = mockHttpPost();
    const chatCore = ProvideChatCore(configWithVersion);
    await chatCore.streamNextMessage(mockedMessageRequest);
    expect(httpServiceSpy).toHaveBeenCalledWith(
      "https://liveapi.yext.com/v2/accounts/me/chat/my-bot/message/streaming",
      { v: defaultApiVersion },
      {
        version: 42,
        conversationId: "my-id",
        context: {
          foo: "bar",
        },
        messages: [],
        promptPackage: "stable",
      },
      "my-api-key"
    );
  });
});
