import { StreamEventName, provideChatCore } from "@yext/chat-core";
import { provideChatCoreAwsConnect } from "@yext/chat-core-aws-connect";
import { provideChatCoreZendesk } from "@yext/chat-core-zendesk";

let chatCore = provideChatCore({
  // will be replace with actual env value during rollup build process
  apiKey: process.env.TEST_BOT_API_KEY || "API_KEY_PLACEHOLDER",
  botId: process.env.TEST_BOT_ID,
  endpoints: {
    chat: `https://liveapi-dev.yext.com/v2/accounts/me/chat/${process.env.TEST_BOT_ID}/message`,
    chatStream: `https://liveapi-dev.yext.com/v2/accounts/me/chat/${process.env.TEST_BOT_ID}/message/streaming`,
  },
});

//ChatCoreAwsConnect | ChatCoreZendesk | null
let agentCore;
let currentResponder = "BOT";

const msgInput = document.getElementById("messageInput");
const msgs = document.getElementById("messages");
const jsonRes = document.getElementById("chatresult");
const loading = document.getElementById("loading");
const convoHistory = [];

window.resetSession = () => {
  if (agentCore?.getSession()) {
    agentCore.resetSession();
  }
  msgs.innerHTML = "";
  jsonRes.textContent = "";
  convoHistory = [];
};

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

  if (agentCore?.getSession()) {
    await agentCore.processMessage(req);
  } else {
    currentResponder = "BOT";
    loading.textContent = "Chat API processing...";
    const data = await chatCore.getNextMessage(req);

    loading.textContent = "";
    convoHistory.push(data.message);
    jsonRes.textContent = JSON.stringify(data, null, 2);
    msgs.appendChild(createListItem(currentResponder, data.message.text));

    if (data?.integrationDetails?.awsConnectHandoff?.credentials) {
      currentResponder = "AWS_CONNECT";
      agentCore = provideChatCoreAwsConnect();
      handleHandoff(data);
    } else if (data?.integrationDetails?.zendeskHandoff) {
      currentResponder = "ZENDESK";
      agentCore = provideChatCoreZendesk({
        integrationId: process.env.TEST_ZENDESK_INTEGRATION_ID,
      });
      handleHandoff(data);
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

function createListItem(source, text) {
  const li = document.createElement("li");
  li.textContent = `${source}: ${text}`;
  return li;
}

let typeEventResetId;
async function handleHandoff(data) {
  await agentCore.init(data);
  agentCore.on("message", (message) => {
    loading.textContent = "";
    msgs.appendChild(createListItem(currentResponder, message));
  });

  agentCore.on("close", (_) => {
    msgs.appendChild(createListItem("DISCONNECT", ""));
  });

  agentCore.on("typing", (isTyping) => {
    loading.textContent = isTyping ? "Agent is typing..." : "";
  });

  msgInput.addEventListener("keypress", async () => {
    agentCore.emit("typing", true);
    window.clearTimeout(typeEventResetId);
    typeEventResetId = window.setTimeout(() => {
      agentCore.emit("typing", false);
    }, 2000);
  });
}
