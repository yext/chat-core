import { EndpointsFactory } from "../../src/infra/EndpointsFactory";

it("provides proper endpoint for default env, region, and businessId", () => {
  const endpoints = EndpointsFactory.getEndpoints({
    botId: "my-bot",
  });
  expect(endpoints).toEqual({
    chat: `https://cdn.yextapis.com/v2/accounts/me/chat/my-bot/message`,
    chatStream: `https://cdn.yextapis.com/v2/accounts/me/chat/my-bot/message/streaming`,
  });
});

it("provides proper endpoint for custom env", () => {
  const endpoints = EndpointsFactory.getEndpoints({
    botId: "my-bot",
    env: "SANDBOX",
  });
  expect(endpoints).toEqual({
    chat: `https://sbx-cdn.yextapis.com/v2/accounts/me/chat/my-bot/message`,
    chatStream: `https://sbx-cdn.yextapis.com/v2/accounts/me/chat/my-bot/message/streaming`,
  });
});

it("provides proper endpoint for custom region", () => {
  const endpoints = EndpointsFactory.getEndpoints({
    botId: "my-bot",
    region: "EU",
  });
  expect(endpoints).toEqual({
    chat: `https://cdn.eu.yextapis.com/v2/accounts/me/chat/my-bot/message`,
    chatStream: `https://cdn.eu.yextapis.com/v2/accounts/me/chat/my-bot/message/streaming`,
  });
});

it("provides proper endpoint for custom businessId", () => {
  const endpoints = EndpointsFactory.getEndpoints({
    botId: "my-bot",
    businessId: 123,
  });
  expect(endpoints).toEqual({
    chat: `https://cdn.yextapis.com/v2/accounts/123/chat/my-bot/message`,
    chatStream: `https://cdn.yextapis.com/v2/accounts/123/chat/my-bot/message/streaming`,
  });
});

it("throws error on invalid region + env", () => {
  expect(() =>
    EndpointsFactory.getEndpoints({
      botId: "my-bot",
      region: "EU",
      env: "SANDBOX",
    })
  ).toThrow('Unsupported domain: invalid environment "SANDBOX" for region EU');
});
