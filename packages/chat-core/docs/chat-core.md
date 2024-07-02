<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [@yext/chat-core](./chat-core.md)

## chat-core package

## Classes

|  Class | Description |
|  --- | --- |
|  [ApiError](./chat-core.apierror.md) | Represents an API error |
|  [StreamResponse](./chat-core.streamresponse.md) | Wrapper class around [RawResponse](./chat-core.rawresponse.md) that provides an interface for working with Chat's streaming data in both browser and Node environments. |

## Enumerations

|  Enumeration | Description |
|  --- | --- |
|  [Environment](./chat-core.environment.md) | Defines the environment of the API domains. |
|  [MessageSource](./chat-core.messagesource.md) | Types of sender of a message. |
|  [Region](./chat-core.region.md) | The region to send the requests to. |
|  [StreamEventName](./chat-core.streameventname.md) | Names of stream events returned from Chat Stream API. |

## Functions

|  Function | Description |
|  --- | --- |
|  [provideChatCore(config)](./chat-core.providechatcore.md) | Provider for the ChatCore library. |

## Interfaces

|  Interface | Description |
|  --- | --- |
|  [AwsConnectCredentials](./chat-core.awsconnectcredentials.md) | AWS Connect handoff credentials. |
|  [AwsConnectHandoff](./chat-core.awsconnecthandoff.md) | Configurations for AWS Connect handoff. |
|  [ChatConfig](./chat-core.chatconfig.md) | The configuration options for [ChatCore](./chat-core.chatcore.md)<!-- -->. |
|  [ChatCore](./chat-core.chatcore.md) | Provide methods for interacting with Chat API. |
|  [EndEvent](./chat-core.endevent.md) | An event that indicates end of Chat stream. |
|  [Endpoints](./chat-core.endpoints.md) | The URLs which are used when making requests to the Chat API. |
|  [IntegrationDetails](./chat-core.integrationdetails.md) | Integration details for the current conversation. |
|  [Message](./chat-core.message.md) | Represents a message within a conversation. |
|  [MessageNotes](./chat-core.messagenotes.md) | Information relevant to the current state of the conversation, serving as the bot’s "memory" regarding what work it previously did to help determine future actions. |
|  [MessageRequest](./chat-core.messagerequest.md) | A request to Chat API. |
|  [MessageResponse](./chat-core.messageresponse.md) | A response from Chat API. |
|  [StartEvent](./chat-core.startevent.md) | An event that indicates start of Chat stream. |
|  [TokenStreamData](./chat-core.tokenstreamdata.md) | Data returned from a [TokenStreamEvent](./chat-core.tokenstreamevent.md)<!-- -->. |
|  [TokenStreamEvent](./chat-core.tokenstreamevent.md) | An event that carries a partial response. |

## Type Aliases

|  Type Alias | Description |
|  --- | --- |
|  [EnumOrLiteral](./chat-core.enumorliteral.md) | Produces a union type from the enum passed as a generic which consists of the enum values and the string literals of the enum. |
|  [RawResponse](./chat-core.rawresponse.md) | Raw response from Chat API. |
|  [StreamEvent](./chat-core.streamevent.md) | Types of stream events returned from Chat Stream API. |
|  [StreamEventCallback](./chat-core.streameventcallback.md) | A function to execute when a [StreamEvent](./chat-core.streamevent.md) occurs. |
