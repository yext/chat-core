<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [@yext/chat-core](./chat-core.md) &gt; [ChatCore](./chat-core.chatcore.md) &gt; [streamNextMessage](./chat-core.chatcore.streamnextmessage.md)

## ChatCore.streamNextMessage() method

Make a request to Chat streaming API to generate the next message and consume its tokens via server-sent events.

**Signature:**

```typescript
streamNextMessage(request: MessageRequest): Promise<StreamResponse>;
```

## Parameters

|  Parameter | Type | Description |
|  --- | --- | --- |
|  request | [MessageRequest](./chat-core.messagerequest.md) | request to get next message |

**Returns:**

Promise&lt;[StreamResponse](./chat-core.streamresponse.md)<!-- -->&gt;

## Remarks

If rejected, an [ApiError](./chat-core.apierror.md) is returned.

