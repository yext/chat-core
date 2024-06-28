# chat-core-aws-connect

a library used for integrating Yext Chat with the Amazon Connect agent platform.

- Works in both the **browser** and **Node.js**
- 100% **TypeScript**, with detailed request and response models
- Compatible with both **CommonJS** and **ES6** imports

## Usage

```typescript
import {
  provideChatCoreAwsConnect,
  StreamEventName,
  Message,
} from "@yext/chat-core-aws-connect";

const chatCoreAwsConnect = provideChatCoreAwsConnect();
await chatCoreAwsConnect.init();

const messages: Message[] = [
  {
    source: "USER",
    text: "Could I get some assistance?",
    timestamp: "2023-05-15T17:33:38.373Z",
  },
];

await chatCoreAwsConnect.processMessage({ messages });
```

## Documentation

See **[our documentation](./docs/chat-core-aws-connect.md)** for a more details on supported API calls and interfaces.
