import { MessageRequest, MessageSource } from '../src';
import { ChatCore } from '../src/ChatCore';
import { defaultApiVersion } from '../src/constants';
import { HttpService } from '../src/http/HttpService';

const emptyMessageRequest: MessageRequest = {
  messages: []
};
it('sets default api domain, businessId, version when not specified', async () => {
  const httpServiceSpy = jest.spyOn(HttpService.prototype, 'post')
    .mockResolvedValue({
      response: {},
      meta: {}
    });
  const chatCore = new ChatCore({
    botId: 'my-bot',
    apiKey: 'my-api-key'
  });
  await chatCore.getNextMessage(emptyMessageRequest);
  expect(httpServiceSpy).toHaveBeenCalledWith(
    'https://liveapi.yext.com/v2/accounts/me/chat/my-bot/message',
    { v: defaultApiVersion },
    { version: 'PRODUCTION', messages: [] },
    'my-api-key'
  );
});

it('sets custom api domain, businessId, version when specified', async () => {
  const httpServiceSpy = jest.spyOn(HttpService.prototype, 'post')
    .mockResolvedValue({
      response: {},
      meta: {}
    });
  const chatCore = new ChatCore({
    botId: 'my-bot',
    apiKey: 'my-api-key',
    version: 'STAGING',
    apiDomain: 'my-domain.com',
    businessId: 1234567,
  });
  await chatCore.getNextMessage(emptyMessageRequest);
  expect(httpServiceSpy).toHaveBeenCalledWith(
    'https://my-domain.com/v2/accounts/1234567/chat/my-bot/message',
    { v: defaultApiVersion },
    { version: 'STAGING', messages: [] },
    'my-api-key'
  );
});

it('returns message response on successful API response', async () => {
  const expectedMessageResponse = {
    message: {
      text: 'hello world!',
      source: MessageSource.BOT,
      timestamp: 123456789,
    },
    notes: {
      currentGoal: 'test!'
    }
  };
  jest.spyOn(HttpService.prototype, 'post')
    .mockResolvedValue({
      response: expectedMessageResponse,
      meta: {}
    });
  const chatCore = new ChatCore({
    botId: 'my-bot',
    apiKey: 'my-api-key',
    version: 'STAGING',
    apiDomain: 'my-domain.com',
    businessId: 1234567,
  });
  const res = await chatCore.getNextMessage(emptyMessageRequest);
  expect(res).toEqual(expectedMessageResponse);
});

it('returns rejected promise on a failed API response', async () => {
  jest.spyOn(HttpService.prototype, 'post')
    .mockResolvedValue({
      response: {},
      meta: {
        errors: [
          {
            message: 'Invalid API Key',
            code: 1,
            type: 'FATAL_ERROR'
          }
        ]
      }
    });
  const chatCore = new ChatCore({
    botId: 'my-bot',
    apiKey: 'my-api-key',
  });
  await expect(chatCore.getNextMessage(emptyMessageRequest))
    .rejects.toThrowError('Chat API error: FATAL_ERROR: Invalid API Key. (code: 1)');
});
