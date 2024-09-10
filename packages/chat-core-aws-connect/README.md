# chat-core-aws-connect

a library used for integrating Yext Chat with the Amazon Connect agent platform.

- 100% **TypeScript**, with detailed request and response models
- Currently only supports browser-based chat sessions

## Usage

```typescript
import { provideChatCoreAwsConnect } from "@yext/chat-core-aws-connect";
import { MessageResponse } from "@yext/chat-core";

// create a new instance of ChatCoreAwsConnect
const chatCoreAwsConnect = provideChatCoreAwsConnect();

// with some response from the Chat API containing handoff credentials...
const chatApiResponse: MessageResponse;

// initiate a connection to Amazon Connect using the credentials
await chatCoreAwsConnect.init(chatApiResponse);

// create a payload
const req = {
  messages: [
    {
      timestamp: "2023-05-17T19:21:21.915Z",
      source: "USER",
      text: "Could I get some assistance?",
    },
  ],
};

// send it to Connect!
await chatCoreAwsConnect.processMessage(req);
```

## Documentation

See **[our documentation](./docs/chat-core-aws-connect.md)** for a more details on supported API calls and interfaces.
