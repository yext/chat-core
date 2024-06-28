import { ChatCoreAwsConnect } from "../models/ChatCoreAwsConnect";
import { MessageRequest, MessageResponse } from "@yext/chat-core";
import { AwsConnectEvent } from "../models/AwsConnectEvent";
import { EventCallback } from "../models/EventCallback";
import "amazon-connect-chatjs";

// TODO: Remove this type once the integration details are added to the MessageResponse type in chat-core
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
  private eventListeners: Record<string, EventCallback[]> = {};

  async init(messageRsp: MessageResponse): Promise<void> {
    if (this.session) {
      console.warn("Chat session already initialized");
      return;
    }

    // TODO: Remove this type assertion once the integration details are added to the MessageResponse type in chat-core
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
        // There are five levels available - DEBUG, INFO, WARN, ERROR, ADVANCED_LOG. Default is INFO
        level: window.connect.LogLevel.ERROR,
        useDefaultLogger: true,
      },
      region: messageResponse.integrationDetails.awsConnectHandoff.region,
    });

    this.session = connect.ChatSession.create({
      chatDetails: connectionCreds,
      type: "CUSTOMER",
    }) as connect.ActiveChatSession;

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

  on(eventName: string, cb: EventCallback): void {
    if (!this.eventListeners[eventName]) {
      this.eventListeners[eventName] = [];
    }
    this.eventListeners[eventName].push(cb);
  }

  emit(eventName: string, data: any): void {
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
