import { MessageRequest, MessageResponse, MessageSource } from "../src";
import { ChatCore } from "../src/ChatCore";
import { defaultApiVersion } from "../src/constants";
import { HttpService } from "../src/http/HttpService";

const mockedMessageRequest: MessageRequest = {
  conversationId: "my-id",
  context: {
    foo: "bar",
  },
  messages: [],
};

function mockHttpPost(
  expectedResponse: unknown = { response: {}, meta: {} },
  ok = true
): jest.SpyInstance {
  return jest.spyOn(HttpService.prototype, "post").mockResolvedValue({
    ok,
    json: () => Promise.resolve(expectedResponse),
  } as Response);
}

it("returns message response on successful API response", async () => {
  const expectedMessageResponse: MessageResponse = {
    conversationId: "someId",
    message: {
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
  const chatCore = new ChatCore({
    botId: "my-bot",
    apiKey: "my-api-key",
    version: "STAGING",
    apiDomain: "my-domain.com",
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
  const chatCore = new ChatCore({
    botId: "my-bot",
    apiKey: "my-api-key",
  });
  await expect(
    chatCore.getNextMessage(mockedMessageRequest)
  ).rejects.toThrowError(
    "Chat API error: FATAL_ERROR: Invalid API Key. (code: 1)"
  );
});

describe("URL and http request construction", () => {
  async function testDefault(
    getFn: (c: ChatCore) => (req: MessageRequest) => Promise<unknown>,
    expectedUrl: string
  ) {
    const httpServiceSpy = mockHttpPost();
    const chatCore = new ChatCore({
      botId: "my-bot",
      apiKey: "my-api-key",
    });
    await getFn(chatCore).bind(chatCore)(mockedMessageRequest);
    expect(httpServiceSpy).toHaveBeenCalledWith(
      expectedUrl,
      { v: defaultApiVersion },
      mockedMessageRequest,
      "my-api-key"
    );
  }

  it("sets default api domain and businessId when not specified for Chat API", async () => {
    testDefault(
      (c) => c.getNextMessage,
      "https://liveapi.yext.com/v2/accounts/me/chat/my-bot/message"
    );
  });

  it("sets default api domain and businessId when not specified for Chat Stream API", async () => {
    testDefault(
      (c) => c.streamNextMessage,
      "https://liveapi.yext.com/v2/accounts/me/chat/my-bot/message/streaming"
    );
  });

  async function testCustom(
    getFn: (c: ChatCore) => (req: MessageRequest) => Promise<unknown>,
    expectedUrl: string
  ) {
    const httpServiceSpy = mockHttpPost();
    const chatCore = new ChatCore({
      botId: "my-bot",
      apiKey: "my-api-key",
      version: "STAGING",
      apiDomain: "my-domain.com",
      businessId: 1234567,
    });
    await getFn(chatCore).bind(chatCore)(mockedMessageRequest);
    expect(httpServiceSpy).toHaveBeenCalledWith(
      expectedUrl,
      { v: defaultApiVersion },
      {
        version: "STAGING",
        conversationId: "my-id",
        context: {
          foo: "bar",
        },
        messages: [],
      },
      "my-api-key"
    );
  }

  it("sets custom api domain, businessId, version when specified for Chat API", async () => {
    testCustom(
      (c) => c.getNextMessage,
      "https://my-domain.com/v2/accounts/1234567/chat/my-bot/message"
    );
  });

  it("sets custom api domain, businessId, version when specified for Chat Stream API", async () => {
    testCustom(
      (c) => c.streamNextMessage,
      "https://my-domain.com/v2/accounts/1234567/chat/my-bot/message/streaming"
    );
  });
});
