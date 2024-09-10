import { StreamEventName, provideChatCore } from "@yext/chat-core";
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
const msgInput = document.getElementById("messageInput");
const msgs = document.getElementById("messages");
const jsonRes = document.getElementById("chatresult");
const loading = document.getElementById("loading");
const convoHistory = [];

window.resetSession = () => {
  if (coreAws.getSession()) {
    coreAws.resetSession();
  }

  msgs.innerHTML = "";
  jsonRes.textContent = "";
  convoHistory = [];
};

function createListItem(source, text) {
  const li = document.createElement("li");
  li.textContent = `${source}: ${text}`;
  return li;
}

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

  msgs.appendChild(createListItem("USER", msgInput.value));

  if (coreAws.getSession()) {
    await coreAws.processMessage(req);
  } else {
    loading.textContent = "Chat API processing...";
    const data = await chatCore.getNextMessage(req);
    loading.textContent = "";
    convoHistory.push(data.message);
    jsonRes.textContent = JSON.stringify(data, null, 2);
    msgs.appendChild(createListItem("BOT", data.message.text));

    if (data?.integrationDetails?.awsConnectHandoff?.credentials) {
      coreAws = provideChatCoreAwsConnect();
      coreAws.on("message", (message) => {
        loading.textContent = "";
        msgs.appendChild(createListItem("CONNECT", message));
      });

      coreAws.on("close", (_) => {
        msgs.appendChild(createListItem("DISCONNECT", ""));
      });

      coreAws.on("typing", () => {
        loading.textContent = "Agent is typing...";
        msgs.appendChild(createListItem("CONNECT", "Agent is typing..."));
      });

      msgInput.addEventListener("keypress", async () => {
        coreAws.emit("typing");
      });

      await coreAws.init(data);
    }
  }

  msgInput.value = "";
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
  msgInput.value = "";
};
