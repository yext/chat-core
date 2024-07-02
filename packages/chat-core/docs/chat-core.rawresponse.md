<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [@yext/chat-core](./chat-core.md) &gt; [RawResponse](./chat-core.rawresponse.md)

## RawResponse type

Raw response from Chat API.

**Signature:**

```typescript
export type RawResponse = Response | NodeResponse;
```

## Remarks

Response uses WHATWG ReadableStream API for browser environment and NodeJS.ReadableStream API for node environment.
