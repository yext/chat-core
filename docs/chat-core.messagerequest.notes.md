<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [@yext/chat-core](./chat-core.md) &gt; [MessageRequest](./chat-core.messagerequest.md) &gt; [notes](./chat-core.messagerequest.notes.md)

## MessageRequest.notes property

Information relevant to the current state of the conversation, serving as the bot’s "memory" regarding what work it previously did to help determine future actions.

**Signature:**

```typescript
notes?: MessageNotes;
```

## Remarks

This data will come from the API. As such, a user’s first request may have this as undefined. Subsequent requests will use the data of this type from the previous response.

