/* eslint-disable @typescript-eslint/no-explicit-any */
import http from "http";
import { ChatConfig, StreamEventName, provideChatCore } from "@yext/chat-core";
import dotenv from "dotenv";

dotenv.config();

const config: ChatConfig = {
  apiKey: process.env["TEST_BOT_API_KEY"] || "API_KEY_PLACEHOLDER",
  botId: process.env["TEST_BOT_ID"] || "BOT_ID_PLACEHOLDER",
  endpoints: {
    chat: `https://liveapi-dev.yext.com/v2/accounts/me/chat/${process.env.TEST_BOT_ID}/message`,
    chatStream: `https://liveapi-dev.yext.com/v2/accounts/me/chat/${process.env.TEST_BOT_ID}/message/streaming`,
  },
};

async function stream(res: any) {
  const chatCore = provideChatCore(config);
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
  stream.addEventListener(StreamEventName.EndEvent, () => {
    res.end();
  });
  stream.consume();
}

const server = http.createServer(async (req: any, res: any) => {
  res.statusCode = 200;
  res.setHeader("Content-Type", "text/plain");
  if (req.url === "/streaming") {
    stream(res);
  } else {
    const chatCore = provideChatCore(config);
    const reply = await chatCore.getNextMessage({
      messages: [],
    });
    res.end(JSON.stringify(reply, null, 2));
  }
});

const hostname = "localhost";
const port = 3030;

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
