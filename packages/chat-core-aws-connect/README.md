# chat-core-aws-connect

a library used for integrating Yext Chat with the Amazon Connect agent platform.

- Works in both the **browser** and **Node.js**
- 100% **TypeScript**, with detailed request and response models
- Compatible with both **CommonJS** and **ES6** imports

## Usage

```typescript
import { provideChatCoreAwsConnect } from "@yext/chat-core-aws-connect";
import { Message, MessageResponse } from "@yext/chat-core";

// create a new instance of ChatCoreAwsConnect
const chatCoreAwsConnect = provideChatCoreAwsConnect();

// with some response from the Chat API containing handoff credentials...
const chatApiResponse: MessageResponse;

// initiate a connection to Amazon Connect using the credentials
await chatCoreAwsConnect.init(chatApiResponse);

// create a message payload
const messages: Message[] = [
  {
    source: "USER",
    text: "Could I get some assistance?",
    timestamp: "2023-05-15T17:33:38.373Z",
  },
];

// send it to Connect!
await chatCoreAwsConnect.processMessage({ messages });
```

## Documentation

See **[our documentation](./docs/chat-core-aws-connect.md)** for a more details on supported API calls and interfaces.
