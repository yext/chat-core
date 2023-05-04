import { ChatCore } from '@yext/chat-core';

let chatCore = new ChatCore({
  // will be replace with actual env value during rollup build process
  apiKey: process.env.TEST_BOT_API_KEY ?? 'API_KEY_PLACEHOLDER',
  botId: 'red-dog-bot',
  apiDomain: 'liveapi-dev.yext.com',
});

window.getNextMessage = async () => {
  const data = await chatCore.getNextMessage({
    messages: []
  });
  const el = document.getElementById('chatresult');
  el.innerText = JSON.stringify(data, null, 2);
};
