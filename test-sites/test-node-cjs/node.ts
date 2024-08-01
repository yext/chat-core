/* eslint-disable @typescript-eslint/no-explicit-any */
import http from "http";
import {
  ChatConfig,
  InternalConfig,
  MessageRequest,
  MessageResponse,
  StreamEventName,
  provideChatCoreInternal,
} from "@yext/chat-core";

import {
  provideChatCoreAwsConnect,
} from "@yext/chat-core-aws-connect";

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

const internalConfig: InternalConfig = {
  /** for testing pursposes */
};

const request: MessageRequest = {
  messages: [
    {
      timestamp: "2023-05-17T19:21:21.915Z",
      source: "USER",
      text: "How do I send an email?",
    },
  ],
};

async function stream(res: any) {
  const chatCore = provideChatCoreInternal(config, internalConfig);
  const stream = await chatCore.streamNextMessage(request);
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

const server = http.createServer(async (req, res) => {
  res.statusCode = 200;
  res.setHeader("Content-Type", "text/plain");
  if (req.url === "/streaming") {
    stream(res);
  } else if (req.url === "/aws") {
    let coreAws = provideChatCoreAwsConnect();
    const chatCore = provideChatCoreInternal(config, internalConfig);
    const awsMessageRequest : MessageRequest = {
      messages: [
        {
          timestamp: "2023-05-17T19:21:21.915Z",
          source: "USER",
          text: "I want to talk to an agent",
        },
      ],
    };
    const data : MessageResponse = await chatCore.getNextMessage(awsMessageRequest);
    await coreAws.init(data);
  
  } else {
    const chatCore = provideChatCoreInternal(config, internalConfig);
    const reply = await chatCore.getNextMessage(request);
    res.end(JSON.stringify(reply, null, 2));
  }
});

const hostname = "localhost";
const port = 3030;

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
