/* eslint-disable @typescript-eslint/no-explicit-any */
import http from "http";
import {
  ChatConfig,
  InternalConfig,
  MessageRequest,
  StreamEventName,
  provideChatCoreInternal,
} from "@yext/chat-core";
import dotenv from "dotenv";

dotenv.config();

const SunshineConversationsClient = require('sunshine-conversations-client')
const defaultClient = SunshineConversationsClient.ApiClient.instance;
// Configure HTTP basic authorization: basicAuth
const basicAuth = defaultClient.authentications['basicAuth'];
basicAuth.username = 'app_65f47ae8b9abcc933fd17de3'
basicAuth.password = 'pmeuH7n_Eumw7gZwsTF8y-8T7vSswDJvac2W-4L8avh8P50bEUetWD2DCdtPLV4VFJBfMu_Opf5o8fLVlXWFVw'

// const convoApiInstance = new SunshineConversationsClient.ConversationsApi();
// const participantsApiInstance = new SunshineConversationsClient.ParticipantsApi();
const messagesApiInstance = new SunshineConversationsClient.MessagesApi();

const appId = "63320dceb6c27f00f3925dd2";
const conversationId = "65f8a3bac9c8043e32efccc7";

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


async function getZendeskMessages() {
  try {
    const res = await fetch("https://tags1632230385.zendesk.com/sc/v2/apps/63320dceb6c27f00f3925dd2/conversations/65f8a3bac9c8043e32efccc7/messages", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: 'Basic ' + Buffer.from(`${basicAuth.username}:${basicAuth.password}`).toString("base64")
      }
    })
    return res.json()
  } catch (e) {
    console.log('error', e)
  }
}

async function getSwitchboard() {
  try {
    const res = await fetch("https://tags1632230385.zendesk.com/sc/v2/apps/63320dceb6c27f00f3925dd2/switchboards", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: 'Basic ' + Buffer.from(`${basicAuth.username}:${basicAuth.password}`).toString("base64")
      }
    })
    return res.json()
  } catch (e) {
    console.log('error', e)
  }
}

async function getSwitchboardIntegrations() {
  try {
    const res = await fetch("https://tags1632230385.zendesk.com/sc/v2/apps/63320dceb6c27f00f3925dd2/switchboards/63320dcfa1d65400f3d8d425/switchboardIntegrations", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: 'Basic ' + Buffer.from(`${basicAuth.username}:${basicAuth.password}`).toString("base64")
      }
    })
    return res.json()
  } catch (e) {
    console.log('error', e)
  }
}

async function getConversation() {
  try {
    const res = await fetch("https://tags1632230385.zendesk.com/sc/v2/apps/63320dceb6c27f00f3925dd2/conversations?filter[userExternalId]=123456789", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: 'Basic ' + Buffer.from(`${basicAuth.username}:${basicAuth.password}`).toString("base64")
      }
    })
    return res.json()
  } catch (e) {
    console.log('error', e)
  }
}

async function sendMessage(input: string) {
  try {
    const res = await fetch("https://tags1632230385.zendesk.com/sc/v2/apps/63320dceb6c27f00f3925dd2/conversations/65f8a3bac9c8043e32efccc7/messages", {
      method: "POST",
      body: JSON.stringify({
        author: {
          type: "user",
          userExternalId: "123456789"
        },
        content: {
          type: "text",
          text: input
        }
      }),
      headers: {
        "Content-Type": "application/json",
        Authorization: 'Basic ' + Buffer.from(`${basicAuth.username}:${basicAuth.password}`).toString("base64")
      }
    })
    return res.json()
  } catch (e) {
    console.log('error', e)
  }
}

async function zendesk(req: any, res: any) {
  // const messagePost = new SunshineConversationsClient.MessagePost(
  //   new SunshineConversationsClient.Author("user"),
  //   new SunshineConversationsClient.Author("user")
  // );
  let data: any;

  //join conversation
  // try {
  //   data = await participantsApiInstance.joinConversation(appId, conversationId, {
  //     userExternalId: '123456789',
  //     subscribeSDKClient: false
  //   })
  // } catch (e) {
  //   console.error('ERROR1', e);
  //   res.end(JSON.stringify("ERROR", null, 2));
  //   return;
  // }
  // console.log('Join conversation successfully. Returned data: ' + data);
  // res.end(JSON.stringify("DONE", null, 2));
  
  //post message
  try {
    data = await messagesApiInstance.postMessage(appId, conversationId, {
      author: {
        type: 'user',
        userExternalId: '123456789'
      },
      content: {
        type: "text",
        text: "this is a test message!"
      },
      metadata: {
        "hello": "world"
      }
    })
  } catch (e) {
    console.error('ERROR2', e);
    res.end(JSON.stringify("ERROR2", null, 2));
    return;
  }
  console.log('Post message successfully. Returned data: ');
  res.end(JSON.stringify(data, null, 2));
}

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

const server = http.createServer(async (req: any, res: any) => {
  res.statusCode = 200;
  res.setHeader("Content-Type", "text/plain");
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:5050');
  console.log(req.url)
  if (req.url === '/zendesk') {
    zendesk(req, res)
    return;
  }
  if (req.url == '/zendesk/getMessages') {
    const a = await getZendeskMessages()
    res.end(JSON.stringify(a, null, 2));
    return;  
  }
  if (req.url == '/zendesk/getSwitchboard') {
    const a = await getSwitchboard()
    res.end(JSON.stringify(a, null, 2));
    return;  
  }
  if (req.url == '/zendesk/getSwitchboardIntegrations') {
    const a = await getSwitchboardIntegrations()
    res.end(JSON.stringify(a, null, 2));
    return;  
  }
  if (req.url == '/zendesk/getConversation') {
    const a = await getConversation()
    res.end(JSON.stringify(a, null, 2));
    return;  
  }
  if (req.url == '/zendesk/sendMessage') {
    const chunks: any[] = [];
    req.on('data', (c: any) => {
      chunks.push(c)
    });
    req.on('end', async () => {
      const data = Buffer.concat(chunks).toString();
      const parsedData = JSON.parse(data);
      const a = await sendMessage(parsedData.text)
      res.end(JSON.stringify(a, null, 2));
      return;  
    })
  }
});

const hostname = "localhost";
const port = 3030;

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
