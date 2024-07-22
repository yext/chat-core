import { provideChatCoreZendesk } from "@yext/chat-core-zendesk";
// import Smooch from "smooch";

let chatCoreZendesk = provideChatCoreZendesk({
  integrationId: "668dfb7e5c408293fc4b7ec9"
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
window.sendMessage = async () => {
  console.log('window.sendMessage')
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
