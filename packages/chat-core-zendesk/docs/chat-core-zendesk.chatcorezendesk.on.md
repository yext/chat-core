<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [@yext/chat-core-zendesk](./chat-core-zendesk.md) &gt; [ChatCoreZendesk](./chat-core-zendesk.chatcorezendesk.md) &gt; [on](./chat-core-zendesk.chatcorezendesk.on.md)

## ChatCoreZendesk.on() method

Register a callback for an event triggered within the Zendesk chat session. Supported events are: - `message`<!-- -->: A new message has been received. - `typing`<!-- -->: The agent is typing. - `close`<!-- -->: The chat session has been closed (e.g. agent left or closed the ticket).

**Signature:**

```typescript
on<T extends keyof EventMap>(eventName: T, cb: EventCallback<T>): void;
```

## Parameters

|  Parameter | Type | Description |
|  --- | --- | --- |
|  eventName | T | The name of the event to listen for. |
|  cb | EventCallback&lt;T&gt; | The callback to be executed when the event is triggered. |

**Returns:**

void
