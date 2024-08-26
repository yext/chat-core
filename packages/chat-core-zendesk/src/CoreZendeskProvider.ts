import { MessageRequest, MessageResponse } from "@yext/chat-core";

interface Conversation {
  id: string;
  description: string;
  displayName: string;
  lastUpdatedAt: number;
  messages: any[]; //limited
  metadata: Record<string, any>;
}

interface Message {
  id: string;
  displayName: string;
  metadata: Record<string, any>;
  received: number;
  role: string;
  source: {
    type: string;
  };
  subroles: string[];
  text: string;
  type: string;
}
// export interface Smooch {
//     init(config: InitOptions): any;
//     render(element: HTMLElement): void;
//     // see https://github.com/zendesk/sunshine-conversations-web for more info
//     on(event: string, callback: (...arg: any) => void): void;
//     startTyping(): void;
//     stopTyping(): void;
//     sendMessage(message: string, conversationId: string): void;
//     createConversation(): Promise<any>;
// }
// import SmoochLib from "smooch";
// const Smooch: Smooch = SmoochLib.default;

//this work in browser test site in chat-core (uses ESM package), but not in chat-ui-react. could be per compiler? webpack issue
// import Smooch from "smooch";

//this doesn't work in chat-core site, but work in chat-ui-react (uses ESM package as well)
// import SmoochLib from "smooch";
// const Smooch = SmoochLib.default


/**
 * The Smooch SDK only exports as a CommonJS (CJS) module, which can cause issues when importing
 * with ES6 module (ESM) syntax in different bundlers based on their interop behavior (e.g., Rollup, Webpack).
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
const Smooch = SmoochLib.default || SmoochLib;

/**
 * NOTE:
 * - this can NOT support node, because this expects to render on a div.
 * - license is not pre-approved
 * - this still uses switchboard to facilitate messages from beginning to end, so we are subject to their limitations
 * - there is no good way of deleting messages of a conversation to start a new, so we need to enable multi-convo feature for this to work
 * 
 */

/**
 * 
 * @public
 */
export function provideChatCoreZendesk(config: ChatCoreZendeskConfig) {
  return new ChatCoreZendeskImpl(config);
}

/**
 * A generic event callback, to be used when defining listeners for a {@link ChatCoreAwsConnect}.
 *
 * @public
 */
export type EventCallback<T extends keyof EventMap> = (
  arg: EventMap[T]
) => void;

/**
 * A map of events that can be emitted or listened for within a {@link ChatCoreAwsConnect} to their associated data types.
 *
 * @public
 */
export type EventMap = {
  message: string;
  typing: boolean;
  close: any; //ZendeskEventData;
};

interface ChatCoreZendeskConfig {
  integrationId: string
}


class ChatCoreZendeskImpl {
  private eventListeners: { [T in keyof EventMap]?: EventCallback<T>[] } = {};
  private conversationId: string | undefined;
  private integrationId: string;
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  constructor(config: ChatCoreZendeskConfig) {
    if (window === undefined) {
      throw new Error("This package can only be used in the browser.");
    }
    this.integrationId = config.integrationId;
  }

  async _init() {
    return new Promise<void>((resolve, reject) => {
      console.log('Smooch: init ...')
      Smooch.init({
        integrationId: this.integrationId,
        embedded: true,
        soundNotificationEnabled: false,
      }).then(() => {
        resolve();
      }).catch((e: any) => {
        reject(e);
      });
    });
  }
  
  async init(_messageResponse: MessageResponse) {
    const div = window.document.createElement('div')
    window.document.body.appendChild(div);
    div.id = 'yext-chat-core-zendesk-container';
    div.style.display = 'none';
    Smooch.render(div);
    
    await this._init();
    this.setupEventListeners();
    await this.setupSession();
  }

  private async setupSession() {
    console.log('Smooch: setup conversation')
    // const conversations = Smooch.getConversations();
    // console.log('conversations', conversations)
    // Smooch.createConversation().then((conversation: any) => {
    //   console.log('create conversation', conversation)
    // }).catch((e: any) => console.error("error create conversation", e))

    const convo: Conversation = await Smooch.createConversation();
    console.log('convo', convo)
    this.conversationId = convo.id
  }

  private setupEventListeners() {
    Smooch.on('message', (message: Message, data: any) => {
      console.log('message', message)
      console.log('data', data)
      this.eventListeners["message"]?.forEach((cb) => cb(message.text));
      this.eventListeners["typing"]?.forEach((cb) => cb(false));
    });
    Smooch.on('typing:start', () => {
      this.eventListeners["typing"]?.forEach((cb) => cb(true));
    });
    Smooch.on('typing:stop', () => {
      this.eventListeners["typing"]?.forEach((cb) => cb(false));
    });
    Smooch.on('disconnected', (data: any) => {
      console.error('Zendesk chat disconnected', data);
    });
    Smooch.on('participant:removed', (data: any) => {
      console.log('participant:removed', data);
    });
    Smooch.on('conversation:read', (data: any) => {
      console.log('conversation:read', data);
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
          Smooch.startTyping();
        } else {
          Smooch.stopTyping();
        }
        break;
    }
  }

  private sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  

  async processMessage(request: MessageRequest) {
    console.log('processMessage', request)
    if (!this.conversationId) {
      throw new Error('No conversationId found');
    }
    const text = request.messages.at(-1)?.text;
    if (!text) {
      throw new Error('No text found in message');
    }
    Smooch.sendMessage(text, this.conversationId);
  }

  getSession() {
    return null
  }

  resetSession() {
    return null
  }
}