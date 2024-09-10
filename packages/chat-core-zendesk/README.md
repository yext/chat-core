# chat-core-zendesk

a library used for integrating Yext Chat with the Zendesk agent platform.

- 100% **TypeScript**, with detailed request and response models
- Currently only supports browser-based chat sessions

## Usage

```typescript
import { provideChatCoreZendesk } from "@yext/chat-core-zendesk";
import { MessageResponse } from "@yext/chat-core";

// create a new instance of ChatCoreZendesk
const chatCoreZendesk = provideChatCoreZendesk();

// with some response from the Chat API containing handoff credentials...
const chatApiResponse: MessageResponse;

// initiate a connection to Zendesk agent platform with the conversation summary as the initial message
await chatCoreZendesk.init(chatApiResponse);

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

// send message to agent!
await chatCoreZendesk.processMessage(req);
```

## Documentation

See **[our documentation](./docs/chat-core-zendesk.md)** for a more details on supported API calls and interfaces.
