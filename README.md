# chat-core
a networking library for interacting with the Yext Chat API

- Works in both the **browser** and **Node.js**
- 100% **TypeScript**, with detailed request and response models
- Compatible with both **CommonJS** and **ES6** imports

## Usage
````typescript
import { ChatCore } from '@yext/chat-core';

const chatCore = new ChatCore({
  botId: "YOUR_BOT_ID",
  apiKey: "YOUR_API_KEY"
})

response = await chatCore.getNextMessage({
    messages: [{
    source: "USER",
    text: "What is Yext Chat?",
    timestamp: 1234566789
  }]
})
````

## Documentation
See **[our documentation](./docs/chat-core.md)** for a more details on supported API calls and interfaces.
