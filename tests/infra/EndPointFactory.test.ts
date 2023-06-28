import { EndpointsFactory } from "../../src/infra/EndpointsFactory";

it("provides proper endpoint for default env, region, and businessId", () => {
  const endpoints = EndpointsFactory.getEndpoints({
    botId: "my-bot",
  });
  expect(endpoints).toEqual({
    chat: `https://liveapi.yext.com/v2/accounts/me/chat/my-bot/message`,
    chatStream: `https://liveapi.yext.com/v2/accounts/me/chat/my-bot/message/streaming`,
  });
});

it("provides proper endpoint for custom env", () => {
  const endpoints = EndpointsFactory.getEndpoints({
    botId: "my-bot",
    env: "SANBOX",
  });
  expect(endpoints).toEqual({
    chat: `https://liveapi-sbx.yext.com/v2/accounts/me/chat/my-bot/message`,
    chatStream: `https://liveapi-sbx.yext.com/v2/accounts/me/chat/my-bot/message/streaming`,
  });
});

it("provides proper endpoint for custom region", () => {
  const endpoints = EndpointsFactory.getEndpoints({
    botId: "my-bot",
    region: "eu",
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
    chat: `https://liveapi.yext.com/v2/accounts/123/chat/my-bot/message`,
    chatStream: `https://liveapi.yext.com/v2/accounts/123/chat/my-bot/message/streaming`,
  });
});

it("throws error on invalid region + env", () => {
  expect(() =>
    EndpointsFactory.getEndpoints({
      botId: "my-bot",
      region: "eu",
      env: "SANBOX",
    })
  ).toThrow('Unsupported domain: invalid environment "SANBOX" for region EU');
});
