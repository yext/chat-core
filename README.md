# chat-core

a networking library for interacting with the Yext Chat API

- Works in both the **browser** and **Node.js**
- 100% **TypeScript**, with detailed request and response models
- Compatible with both **CommonJS** and **ES6** imports

## Usage

```typescript
import { provideChatCore, StreamEventName, Message } from "@yext/chat-core";

const chatCore = provideChatCore({
  botId: "YOUR_BOT_ID",
  apiKey: "YOUR_API_KEY",
});

const messages: Message[] = [
  {
    source: "USER",
    text: "What is Yext Chat?",
    timestamp: "2023-05-15T17:33:38.373Z",
  },
];

// Chat API
response = await chatCore.getNextMessage({ messages });

// Chat Streaming API
stream = await chatCore.streamNextMessage({ messages });
stream.addEventListener(StreamEventName.TokenStreamEvent, (event) =>
  console.log("data", event.data)
);
stream.consume();
```

## Documentation

See **[our documentation](./docs/chat-core.md)** for a more details on supported API calls and interfaces.
