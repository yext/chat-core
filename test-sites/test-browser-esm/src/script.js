import { provideChatCore } from "@yext/chat-core";
import { provideChatCoreAwsConnect } from "@yext/chat-core-aws-connect";

let chatCore = provideChatCore({
  // will be replace with actual env value during rollup build process
  apiKey: process.env.TEST_BOT_API_KEY || "API_KEY_PLACEHOLDER",
  botId: process.env.TEST_BOT_ID,
  endpoints: {
    chat: `https://liveapi-dev.yext.com/v2/accounts/me/chat/${process.env.TEST_BOT_ID}/message`,
    chatStream: `https://liveapi-dev.yext.com/v2/accounts/me/chat/${process.env.TEST_BOT_ID}/message/streaming`,
  },
});

let coreAws = provideChatCoreAwsConnect();

window.resetSession = () => {
  coreAws.resetSession();
};

const msgInput = document.getElementById("messageInput");
window.getNextMessage = async () => {
  const req = {
    messages: [
      {
        timestamp: "2023-05-17T19:21:21.915Z",
        source: "USER",
        text: msgInput.value,
      },
    ],
  };

  const msgs = document.getElementById("messages");
  if (coreAws.getSession()) {
    await coreAws.processMessage(req);
    const li = document.createElement("li");
    li.textContent = "USER: " + msgInput.value;
    msgs.appendChild(li);
  } else {
    const data = await chatCore.getNextMessage(req);
    const el = document.getElementById("chatresult");
    el.textContent = JSON.stringify(data, null, 2);

    if (data?.integrationDetails?.awsConnectHandoff?.credentials) {
      coreAws = provideChatCoreAwsConnect();
      coreAws.on("message", (message) => {
        const li = document.createElement("li");
        li.textContent = "CONNECT: " + message;
        msgs.appendChild(li);
      });

      coreAws.on("close", (_) => {
        const li = document.createElement("li");
        li.textContent = "DISCONNECT";
        msgs.appendChild(li);
      });

      msgInput.addEventListener("keypress", async () => {
        coreAws.emit("typing");
      });

      await coreAws.init(data);
    }
  }
};

window.getNextChatCoreMessage = async () => {
  const data = await chatCore.getNextMessage({
    messages: [],
  });
  const el = document.getElementById("chatresult");
  el.textContent = JSON.stringify(data, null, 2);
};

window.streamNextChatCoreMessage = async () => {
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
