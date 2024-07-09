import { ChatCoreAwsConnect } from "../models/ChatCoreAwsConnect";
import { MessageRequest, MessageResponse } from "@yext/chat-core";
import { AwsConnectEvent } from "../models/AwsConnectEvent";
import { EventMap, EventCallback } from "../models/EventCallback";
import { LoggerConfig } from "../models/LoggerConfig";
import { ChatCoreAwsConnectConfig } from "../models/ChatCoreAwsConnectConfig";
import { isCustomerChatSession } from "../models/ChatSession";
import "amazon-connect-chatjs";

/**
 * The primary class for the chat-core integration with AWS Connect.
 *
 * @internal
 */
export class ChatCoreAwsConnectImpl implements ChatCoreAwsConnect {
  private session?: connect.ActiveCustomerChatSession;
  private eventListeners: { [T in keyof EventMap]?: EventCallback<T>[] } = {};
  private loggerConfig: LoggerConfig = {
    level: "ERROR",
  };

  constructor(config?: ChatCoreAwsConnectConfig) {
    if (!config) {
      return;
    }

    if (config.loggerConfig) {
      this.loggerConfig = config.loggerConfig;
    }
  }

  async init(messageRsp: MessageResponse): Promise<void> {
    if (this.session) {
      console.warn("Chat session already initialized");
      return;
    }

    const connectionCreds =
      messageRsp.integrationDetails?.awsConnectHandoff?.credentials;
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
      region: messageRsp.integrationDetails?.awsConnectHandoff?.region,
    });

    const sess = connect.ChatSession.create({
      chatDetails: connectionCreds,
      type: "CUSTOMER",
    });

    if (!isCustomerChatSession(sess)) {
      throw new Error("Unexpected non-customer chat session type");
    }
    this.session = sess;

    const { connectCalled, connectSuccess } = await this.session.connect({});
    if (!connectCalled || !connectSuccess) {
      throw new Error("Failed to connect to chat session");
    }

    this.setupEventListeners();
    this.session.sendMessage({
      contentType: "text/plain",
      message: `SUMMARY: ${messageRsp.notes.conversationSummary}`,
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
      // Connection is closed. Clear session and create new one on next handoff request.
      this.resetSession();
    });
  }

  on<T extends keyof EventMap>(eventName: T, cb: EventCallback<T>): void {
    if (!this.eventListeners[eventName]) {
      this.eventListeners[eventName] = [];
    }
    this.eventListeners[eventName]?.push(cb);
  }

  emit<T extends keyof EventMap>(eventName: T, eventValue: EventMap[T]): void {
    switch (eventName) {
      case "typing":
        if (eventValue === true) {
          this.session?.sendEvent({
            contentType: "application/vnd.amazonaws.connect.event.typing",
          });
        }
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

  resetSession(): void {
    if (this.session === undefined) {
      return;
    }

    this.session.disconnectParticipant();
    this.session = undefined;
  }
}
