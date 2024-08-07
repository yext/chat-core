<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [@yext/chat-core-aws-connect](./chat-core-aws-connect.md) &gt; [ChatCoreAwsConnect](./chat-core-aws-connect.chatcoreawsconnect.md) &gt; [emit](./chat-core-aws-connect.chatcoreawsconnect.emit.md)

## ChatCoreAwsConnect.emit() method

Emit an event into the Amazon Connect chat session. Supported events are: - `typing`<!-- -->: The customer is typing.

**Signature:**

```typescript
emit<T extends keyof EventMap>(eventName: T, data: EventMap[T]): void;
```

## Parameters

|  Parameter | Type | Description |
|  --- | --- | --- |
|  eventName | T | The name of the event to emit. |
|  data | [EventMap](./chat-core-aws-connect.eventmap.md)<!-- -->\[T\] | The data to be sent with the event. |

**Returns:**

void

