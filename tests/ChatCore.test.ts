import { MessageRequest, MessageResponse, MessageSource } from "../src";
import { ChatCore } from "../src/ChatCore";
import { defaultApiVersion } from "../src/constants";
import { HttpService } from "../src/http/HttpService";

const mockedMessageRequest: MessageRequest = {
  conversationId: "my-id",
  context: {
    foo: "bar"
  },
  messages: [],
};
it("sets default api domain and businessId when not specified", async () => {
  const httpServiceSpy = jest
    .spyOn(HttpService.prototype, "post")
    .mockResolvedValue({
      response: {},
      meta: {},
    });
  const chatCore = new ChatCore({
    botId: "my-bot",
    apiKey: "my-api-key",
  });
  await chatCore.getNextMessage(mockedMessageRequest);
  expect(httpServiceSpy).toHaveBeenCalledWith(
    "https://liveapi.yext.com/v2/accounts/me/chat/my-bot/message",
    { v: defaultApiVersion },
    mockedMessageRequest,
    "my-api-key"
  );
});

it("sets custom api domain, businessId, version when specified", async () => {
  const httpServiceSpy = jest
    .spyOn(HttpService.prototype, "post")
    .mockResolvedValue({
      response: {},
      meta: {},
    });
  const chatCore = new ChatCore({
    botId: "my-bot",
    apiKey: "my-api-key",
    version: "STAGING",
    apiDomain: "my-domain.com",
    businessId: 1234567,
  });
  await chatCore.getNextMessage(mockedMessageRequest);
  expect(httpServiceSpy).toHaveBeenCalledWith(
    "https://my-domain.com/v2/accounts/1234567/chat/my-bot/message",
    { v: defaultApiVersion },
    {
      version: "STAGING",
      conversationId: "my-id",
      context: {
        foo: "bar"
      },
      messages: [],
    },
    "my-api-key"
  );
});

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
  jest.spyOn(HttpService.prototype, "post").mockResolvedValue({
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
  jest.spyOn(HttpService.prototype, "post").mockResolvedValue({
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
  });
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
