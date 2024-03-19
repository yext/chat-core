import { StreamEventName, provideChatCore } from "@yext/chat-core";

let chatCore = provideChatCore({
  // will be replace with actual env value during rollup build process
  apiKey: process.env.TEST_BOT_API_KEY || "API_KEY_PLACEHOLDER",
  botId: process.env.TEST_BOT_ID,
  endpoints: {
    chat: `https://liveapi-dev.yext.com/v2/accounts/me/chat/${process.env.TEST_BOT_ID}/message`,
    chatStream: `https://liveapi-dev.yext.com/v2/accounts/me/chat/${process.env.TEST_BOT_ID}/message/streaming`,
  },
});

window.getNextMessage = async () => {
  const data = await chatCore.getNextMessage({
    messages: [],
  });
  const el = document.getElementById("chatresult");
  el.textContent = JSON.stringify(data, null, 2);
};

window.streamNextMessage = async () => {
  const el = document.getElementById("chatresult-stream");
  el.textContent = "loading...";
  const stream = await chatCore.streamNextMessage({
    messages: [
      {
        timestamp: "2023-05-17T19:21:21.915Z",
        source: "USER",
        text: "How do I send an email?",
      },
    ],
  });
  Object.values(StreamEventName).forEach((eventName) => {
    stream.addEventListener(eventName, (event) => {
      console.log(`${eventName}:`, event.data);
    });
  });
  stream.addEventListener(StreamEventName.StartEvent, (_event) => {
    el.textContent = "";
  });
  stream.addEventListener(StreamEventName.TokenStreamEvent, (event) => {
    el.textContent = el.textContent + event.data.token;
  });
  stream.consume();
};

/**
 * 
 * UI to show the conversation ID + messages
 * user post message
 * show ChatApiServer receiving it and reply
 * UI update to show latest message
 * user post message asking for agent
 * show in Zendesk UI that a conversation is created
 * show that when the ticket is close, it suppose to go back to the bot.
 */

window.getZendeskMessages = async () => {
  const res = await fetch("http://localhost:3030/zendesk/getMessages")
  const data = await res.json()
  const el = document.getElementById("zendesk-messages");
  el.textContent = JSON.stringify(data, null, 2);
  // data.messages?.forEach((message) => {
  //   const p = document.createElement('p')
  //   p.textContent = `[id: ${message.id} | timestamp: ${message.received}]\n${message.author.type == 'user' ? message.author.displayName : 'business'}: ${message.content.text}`
  //   el.appendChild(p)
  // })
}

window.getSwitchboard = async () => {
  const res = await fetch("http://localhost:3030/zendesk/getSwitchboard")
  const data = await res.json()
  const el = document.getElementById("zendesk-switchboard");
  el.textContent = JSON.stringify(data, null, 2);
}

window.getSwitchboardIntegrations = async () => {
  const res = await fetch("http://localhost:3030/zendesk/getSwitchboardIntegrations")
  const data = await res.json()
  const el = document.getElementById("zendesk-switchboard-integrations");
  el.textContent = JSON.stringify(data, null, 2);
}

window.getConversation = async () => {
  const res = await fetch("http://localhost:3030/zendesk/getConversation")
  const data = await res.json()
  const el = document.getElementById("zendesk-conversation");
  el.textContent = JSON.stringify(data, null, 2);
}

window.sendMessage = async () => {
  const res = await fetch("http://localhost:3030/zendesk/sendMessage", {
    method: "POST",
    body: JSON.stringify({
      text: document.getElementById("userInput").value
    })
  })
  const data = await res.json()
  const el = document.getElementById("zendesk-send-message");
  el.textContent = JSON.stringify(data, null, 2);
}