import { provideChatCoreZendesk } from "@yext/chat-core-zendesk";
import { provideChatCore } from "@yext/chat-core";
// import Smooch from "smooch";

let chatCoreZendesk = provideChatCoreZendesk({
  integrationId: "668dfb7e5c408293fc4b7ec9"
});

let chatCore = provideChatCore({
  // will be replace with actual env value during rollup build process
  botId: "yen-bot",
  apiKey: "13427cab97f9c84f8fc858bdc3baf66a",
  endpoints: {
    chat: `https://liveapi-dev.yext.com/v2/accounts/me/chat/yen-bot/message`,
    chatStream: `https://liveapi-dev.yext.com/v2/accounts/me/chat/yen-bot/message/streaming`,
  },
});

window.init = async () => {
  console.log('window.init')
  await chatCoreZendesk.init();
  chatCoreZendesk.on('message', (text) => {
    console.log('message received', text);
    const el = document.getElementById("chatresult");
    el.textContent = el.textContent + `Zendesk: ${text}\n`;
  });
}

const msgInput = document.getElementById("messageInput");
let client = "bot"
window.sendMessage = async () => {
  console.log('window.sendMessage')
  if (client === "bot") {
    const data = await chatCore.getNextMessage({
      messages: [{
        timestamp: "2023-05-17T19:21:21.915Z",
        source: "USER",
        text: msgInput.value,
      }],
    });
    console.log('BOT!', data)
    const el = document.getElementById("chatresult");
    el.textContent = el.textContent + `Bot: ${JSON.stringify(data, null, 2)}\n`;
    if (data?.integrationDetails?.zendeskHandoff) {
      console.log('HANDOFF!')
      await chatCoreZendesk.init();
      chatCoreZendesk.on('message', (text) => {
        console.log('message received', text);
        const el = document.getElementById("chatresult");
        el.textContent = el.textContent + `Zendesk: ${text}\n`;
      });
      client = "zendesk"
      await chatCoreZendesk.processMessage({
        messages: [
          {
            timestamp: "2023-05-17T19:21:21.915Z",
            source: "USER",
            text: "SUMMARY"
          },
        ],
      });
    }
  } else {
    console.log('ZENDESK!')
    await chatCoreZendesk.processMessage({
      messages: [
        {
          timestamp: "2023-05-17T19:21:21.915Z",
          source: "USER",
          text: msgInput.value,
        },
      ],
    });
  }
}


// window.init = async () => {
//   console.log('smooch package init')
//   Smooch.init({
//     integrationId: "668dfb7e5c408293fc4b7ec9",
//     // embedded: true,
//   }).then(() => {
//     console.log('after init');
//   }).catch((error) => {
//     console.error('error', error);
//   })
  // const div = document.createElement('div');
  // document.body.append(div);
  // div.style.display = 'none';

  // Smooch.render(div);
  // const el = document.getElementById("chatresult");
  // el.textContent = JSON.stringify(data, null, 2);
// };
