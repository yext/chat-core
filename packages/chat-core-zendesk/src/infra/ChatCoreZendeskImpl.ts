/* eslint-disable @typescript-eslint/ban-ts-comment */
import { MessageRequest, MessageResponse } from "@yext/chat-core";
import { ChatCoreZendesk } from "../models";

/**
 * Issue 1: Smooch Version
 * version \>5.6.0 appears to use IIFE format and has trouble with rollup and webpack bundling.
 * As such, we are pinning to version 5.6.0 for now, which uses CJS format.
 *
 * Issue 2: Smooch Module Format
 * The Smooch bundled package only exports as a CommonJS (CJS) module, which can cause
 * issues when importing with ES6 module (ESM) syntax in different bundlers based on
 * their interop behavior (e.g., Rollup, Webpack).
 *
 * Ex: the following work in Rollup, but not in Webpack:
 * ```
 * import Smooch from "smooch";
 * ```
 *
 * Ex: the following work in Webpack, but not in Rollup:
 * ```
 * import SmoochLib from "smooch";
 * const Smooch = SmoochLib.default;
 * ```
 *
 * Workaround: This pattern checks if the `default` export is available (in ESM)
 * and falls back to the entire module if it is not (in CJS).
 */
import SmoochLib from "smooch";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore - SmoochLib.default is not in the types
const Smooch = (SmoochLib.default || SmoochLib) as typeof SmoochLib;

import { ChatCoreZendeskConfig } from "../models/ChatCoreZendeskConfig";
import { EventCallback, EventMap } from "../models/EventCallback";
import { ChatCoreZendeskSessionCredentials } from "../models/ChatCoreZendeskSessionCredentials";

const MetadataChatSDKKey = "YEXT_CHAT_SDK";

/**
 * The primary class for the chat-core integration with Zendesk.
 *
 * @remarks
 * Requires multiple conversation feature enabled in the Zendesk app.
 *
 * @internal
 */
export class ChatCoreZendeskImpl implements ChatCoreZendesk {
  private eventListeners: { [T in keyof EventMap]?: EventCallback<T>[] } = {};
  private conversationId: string | undefined;
  private integrationId: string;
  private tags: string[] = ["yext-chat-agent-handoff"];
  private jwt?: string;
  private externalId?: string;
  private onInvalidAuth?: () => string | Promise<string>;

  constructor(config: ChatCoreZendeskConfig) {
    if (window === undefined) {
      throw new Error("This package can only be used in the browser.");
    }
    this.integrationId = config.integrationId;
    this.tags = [...this.tags, ...(config.ticketTags ?? [])];
    this.tags = [...new Set(this.tags)];
    this.jwt = config.jwt;
    this.externalId = config.externalId;
    this.onInvalidAuth = config.onInvalidAuth;
  }

  /**
   * Initialize the chat session with the Smooch Web Messenger SDK using embedded
   * mode on the first invocation. Subsequent calls to this method will create a
   * new conversation session.
   */
  async init(
    messageRsp: MessageResponse
  ): Promise<ChatCoreZendeskSessionCredentials> {
    await this.initializeZendeskSdk();
    return this.createZendeskConversation(messageRsp);
  }

  private async initializeZendeskSdk(): Promise<void> {
    const divId = "yext-chat-core-zendesk-container";
    // If the div already exists, assume the SDK is already initialized
    if (window.document.getElementById(divId)) {
      this.setupEventListeners();
      return;
    }
    const div = window.document.createElement("div");
    window.document.body.appendChild(div);
    div.id = divId;
    div.style.display = "none";
    Smooch.render(div);

    // Smooch.init() returns a Thenable object, not an actual Promise.
    // So we can't use await syntax. Instead, we use try/catch to handle errors.
    return new Promise((resolve, reject) => {
      Smooch.init({
        integrationId: this.integrationId,
        embedded: true,
        soundNotificationEnabled: false,
        ...(this.jwt && { jwt: this.jwt }),
        ...(this.externalId && { externalId: this.externalId }),
        delegate: {
          onInvalidAuth: this.onInvalidAuth,
        },
      })
        .then(() => {
          this.setupEventListeners();
          resolve();
        })
        .catch((e) => {
          console.error("Zendesk SDK init error", e);
          reject(e);
        });
    });
  }

  /**
   * Set up a new session by creating a new conversation with the Smooch SDK.
   * On ticket creation, the metadata is set to include the tag "yext-chat"
   * with the conversation summary as the initial message.
   */
  private async createZendeskConversation(
    messageRsp: MessageResponse
  ): Promise<ChatCoreZendeskSessionCredentials> {
    const ticketFields: Record<string, unknown> = {};
    try {
      if (messageRsp.integrationDetails?.zendeskHandoff?.ticketFields) {
        const rawFields = JSON.parse(
          messageRsp.integrationDetails?.zendeskHandoff?.ticketFields
        );
        for (const key in rawFields) {
          ticketFields[`zen:ticket_field:${key}`] = rawFields[key];
        }
      }
    } catch (e) {
      console.error("Error parsing metadata", e);
    }

    let convo: Conversation = await Smooch.createConversation({
      metadata: {
        ...ticketFields,
        "zen:ticket:tags": this.tags.join(", "),
        // this indicates to the internal zendesk bot webhook that the conversation is from the Chat SDK
        [MetadataChatSDKKey]: true,
      },
    });

    // On first conversation creation of a new user, the id is TEMPORARY_CONVERSATION.
    // We need to re-fetch the current conversation to get the actual id.
    if (convo.id === "TEMPORARY_CONVERSATION") {
      const currentConversation = Smooch.getDisplayedConversation();
      if (!currentConversation) {
        throw new Error("No conversation found");
      }
      convo = currentConversation;
    }
    this.conversationId = convo.id;
    Smooch.loadConversation(convo.id);

    // This is a temporary solution until Zendesk have a more robust way of fetching the ticket id.
    // A Zendesk trigger is setup to make a Sunco API call, using this conversation ID placed inside
    // a Zendesk custom field, to append the corresponding ticket id into the Sunco conversation's
    // metadata. The bot then pull from metadata to inform the user of the ticket id when the messaging
    // session ends.
    const convoIdTicketField = Object.keys(ticketFields).find((key) => {
      return ticketFields[key] === "SUNCO_CONVERSATION_ID_PLACEHOLDER";
    });
    if (convoIdTicketField) {
      await Smooch.updateConversation(convo.id, {
        metadata: { [convoIdTicketField]: convo.id },
      });
    }

    Smooch.sendMessage(
      `SUMMARY: ${
        messageRsp.notes.conversationSummary ??
        "User requested agent assistance"
      }`,
      this.conversationId
    );

    return {
      conversationId: convo.id,
    };
  }

  private setupEventListeners() {
    // @ts-ignore - off() is not in the Smooch types, but does exist
    Smooch.off(); // Unbind all previous event listeners, if any, before setting up new ones
    Smooch.on(
      "message:received",
      (message: Message, data: ConversationData) => {
        if (data.conversation.id !== this.conversationId) {
          return;
        }
        if (
          message.type !== "text" ||
          message.role !== "business" ||
          // @ts-ignore - metadata is not in the Smooch types but it's in the actual data
          message["metadata"]?.type === "csat"
        ) {
          return;
        }

        // If the message is from a bot, indicating the agent has ended the messaging session, then reset the session
        // @ts-ignore - subroles is not in the Smooch types but it's in the actual data
        if (message["subroles"]?.includes("AI")) {
          this.resetSession();
          this.eventListeners["close"]?.forEach((cb) => cb(data));
        }

        this.eventListeners["message"]?.forEach((cb) => cb(message.text));
        this.eventListeners["typing"]?.forEach((cb) => cb(false));
      }
    );
    Smooch.on("typing:start", () => {
      this.eventListeners["typing"]?.forEach((cb) => cb(true));
    });
    Smooch.on("typing:stop", () => {
      this.eventListeners["typing"]?.forEach((cb) => cb(false));
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
          Smooch.startTyping(this.conversationId);
        } else {
          Smooch.stopTyping(this.conversationId);
        }
        break;
    }
  }

  async processMessage(request: MessageRequest) {
    if (!this.conversationId) {
      throw new Error("No conversationId found");
    }
    const text = request.messages.at(-1)?.text;
    if (!text) {
      throw new Error("No text found in message");
    }
    Smooch.sendMessage(text, this.conversationId);
  }

  getSession(): string | undefined {
    return this.conversationId;
  }

  resetSession(): void {
    // @ts-ignore - off() is not in the Smooch types, but does exist
    Smooch.off();
    this.conversationId = undefined;
  }

  async reinitializeSession(
    credentials: ChatCoreZendeskSessionCredentials
  ): Promise<void> {
    this.conversationId = credentials.conversationId;
    await this.initializeZendeskSdk();
    await Smooch.loadConversation(credentials.conversationId);
  }
}
