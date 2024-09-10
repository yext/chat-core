import { MessageRequest, MessageResponse } from "@yext/chat-core";

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
import SmoochLib from 'smooch';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore - SmoochLib.default is not in the types
const Smooch = (SmoochLib.default || SmoochLib) as typeof SmoochLib;

import { ChatCoreZendeskConfig } from "../models/ChatCoreZendeskConfig";
import { EventCallback, EventMap } from "../models/EventCallback";

const MetadataChatSDKKey = "YEXT_CHAT_SDK";

/**
 * The primary class for the chat-core integration with Zendesk.
 * 
 * @remarks
 * Requires multiple conversation feature enabled in the Zendesk app.
 *
 * @internal
 */
export class ChatCoreZendeskImpl {
  private eventListeners: { [T in keyof EventMap]?: EventCallback<T>[] } = {};
  private conversationId: string | undefined;
  private integrationId: string;

  constructor(config: ChatCoreZendeskConfig) {
    if (window === undefined) {
      throw new Error("This package can only be used in the browser.");
    }
    this.integrationId = config.integrationId;
  }

  /**
   * Initialize the chat session with the Smooch Web Messenger SDK using embedded
   * mode on the first invocation. Subsequent calls to this method will create a
   * new conversation session.
   */
  async init(messageRsp: MessageResponse): Promise<void> {
    const divId = 'yext-chat-core-zendesk-container';
    if (!window.document.getElementById(divId)) {
      const div = window.document.createElement('div')
      window.document.body.appendChild(div);
      div.id = divId;
      div.style.display = 'none';
      Smooch.render(div);
      try {
        await Smooch.init({
          integrationId: this.integrationId,
          embedded: true,
          soundNotificationEnabled: false,
        });
      } catch (e) {
        console.error('Zendesk SDK init error', e);
        throw e;
      }
      this.setupEventListeners();
    }
    await this.setupSession(messageRsp);
  }

  /**
   * Set up a new session by creating a new conversation with the Smooch SDK.
   * On ticket creation, the metadata is set to include the tag "yext-chat"
   * with the conversation summary as the initial message.
   */
  private async setupSession(messageRsp: MessageResponse) {
    const convo: Conversation = await Smooch.createConversation({
      metadata: {
        "zen:ticket:tags": "yext-chat",
        // this indicates to the internal zendesk bot webhook that the conversation is from the Chat SDK
        [MetadataChatSDKKey]: true,
      }
    });
    console.log('Smooch: convo', convo)
    this.conversationId = convo.id
    Smooch.loadConversation(convo.id);
    Smooch.sendMessage(messageRsp.notes.conversationSummary ?? "User requested agent assistance", this.conversationId);
  }

  private setupEventListeners() {
    Smooch.on('message:received', (message: Message, data: ConversationData) => {
      // If the message is from a bot, indicating the agent has left or closed the ticket, then reset the session
      if (message.role === 'business' &&
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore - subroles is not in the Smooch types but it's in the actual data
        message['subroles']?.includes('AI')) {
        this.resetSession();
        this.eventListeners["close"]?.forEach((cb) => cb(data));
      }

      this.eventListeners["message"]?.forEach((cb) => cb(message.text));
      this.eventListeners["typing"]?.forEach((cb) => cb(false));
    });
    Smooch.on('typing:start', () => {
      this.eventListeners["typing"]?.forEach((cb) => cb(true));
    });
    Smooch.on('typing:stop', () => {
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
      throw new Error('No conversationId found');
    }
    const text = request.messages.at(-1)?.text;
    if (!text) {
      throw new Error('No text found in message');
    }
    Smooch.sendMessage(text, this.conversationId);
  }

  getSession(): string | undefined {
    return this.conversationId;
  }

  resetSession(): void {
    this.conversationId = undefined;
  }
}