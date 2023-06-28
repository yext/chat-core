import { ChatCore, StreamEventName } from "@yext/chat-core";

let chatCore = new ChatCore({
  // will be replace with actual env value during rollup build process
  apiKey: process.env.TEST_BOT_API_KEY || "API_KEY_PLACEHOLDER",
  botId: process.env.TEST_BOT_ID,
  endpoints: {
    chat: `https://liveapi-dev.yext.com/v2/accounts/me/chat/${process.env.TEST_BOT_ID}/message`,
    chatStream: `https://liveapi-dev.yext.com/v2/accounts/me/chat/${process.env.TEST_BOT_ID}/message/streaming`,
  }
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
