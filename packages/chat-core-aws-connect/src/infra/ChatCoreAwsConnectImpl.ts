import { ChatCoreAwsConnect } from "../models/ChatCoreAwsConnect";
import { MessageRequest, MessageResponse } from "@yext/chat-core";
import { AwsConnectEvent } from "../models/AwsConnectEvent";
import { EventMap, EventCallback } from "../models/EventCallback";
import { LoggerConfig } from "../models/LoggerConfig";
import "amazon-connect-chatjs";

// TODO: Remove this type once the region is added to the MessageResponse type in chat-core
type MessageResponseWithRegion = MessageResponse & {
  integrationDetails: {
    awsConnectHandoff: {
      credentials: {
        accessKeyId: string;
        secretAccessKey: string;
        sessionToken: string;
      };
      region: string;
    };
  };
};

/**
 * The primary class for the chat-core integration with AWS Connect.
 *
 * @internal
 */
export class ChatCoreAwsConnectImpl implements ChatCoreAwsConnect {
  private session?: connect.ActiveChatSession;
  private eventListeners: { [T in keyof EventMap]?: EventCallback<T>[] } = {};
  private loggerConfig: LoggerConfig = {
    level: "ERROR",
  };

  constructor(loggerConfig?: LoggerConfig) {
    if (loggerConfig) {
      this.loggerConfig = loggerConfig;
    }
  }

  async init(messageRsp: MessageResponse): Promise<void> {
    if (this.session) {
      console.warn("Chat session already initialized");
      return;
    }

    // TODO: Remove this type once the region is added to the MessageResponse type in chat-core
    const messageResponse = messageRsp as MessageResponseWithRegion;

    const connectionCreds =
      messageResponse.integrationDetails?.awsConnectHandoff?.credentials;
    if (!connectionCreds) {
      throw new Error(
        "Integration credentials not specified. Cannot initialize chat session."
      );
    }

    connect.ChatSession.setGlobalConfig({
      loggerConfig: {
        level: connect.LogLevel[this.loggerConfig.level],
        useDefaultLogger: this.loggerConfig.customizedLogger ? false : true,
        customizedLogger: this.loggerConfig.customizedLogger,
      },
      region: messageResponse.integrationDetails.awsConnectHandoff.region,
    });

    this.session = connect.ChatSession.create({
      chatDetails: connectionCreds,
      type: "CUSTOMER",
    });

    const { connectCalled, connectSuccess } = await this.session.connect(
      undefined
    );
    if (!connectCalled || !connectSuccess) {
      throw new Error("Failed to connect to chat session");
    }

    this.setupEventListeners();
    this.session.sendMessage({
      contentType: "text/plain",
      message: messageResponse.notes["conversationSummary"],
    });
  }

  private setupEventListeners() {
    this.session?.onMessage((event: AwsConnectEvent) => {
      switch (event.data.ContentType) {
        case "text/plain":
          if (
            event.data.ParticipantRole === "AGENT" ||
            event.data.ParticipantRole === "SYSTEM"
          ) {
            this.eventListeners["message"]?.forEach((cb) =>
              cb(event.data.Content)
            );
            this.eventListeners["typing"]?.forEach((cb) => cb(false));
          }
          break;
      }
    });

    this.session?.onTyping((_: AwsConnectEvent) => {
      this.eventListeners["typing"]?.forEach((cb) => cb(true));

      // after 5s, turn off typing indicator
      setTimeout(() => {
        this.eventListeners["typing"]?.forEach((cb) => cb(false));
      }, 5000);
    });

    this.session?.onEnded((event: AwsConnectEvent) => {
      this.eventListeners["close"]?.forEach((cb) => cb(event.data));
    });
  }

  on<T extends keyof EventMap>(eventName: T, cb: EventCallback<T>): void {
    if (!this.eventListeners[eventName]) {
      this.eventListeners[eventName] = [];
    }
    this.eventListeners[eventName]?.push(cb);
  }

  emit<T extends keyof EventMap>(eventName: T, _: EventMap[T]): void {
    switch (eventName) {
      case "typing":
        this.session?.sendEvent({
          contentType: "application/vnd.amazonaws.connect.event.typing",
        });
        break;
    }
  }

  async processMessage(request: MessageRequest): Promise<void> {
    await this.session?.sendMessage({
      contentType: "text/plain",
      message: request.messages.at(-1)?.text,
    });
  }

  getSession(): connect.ActiveChatSession | undefined {
    return this.session;
  }
}
