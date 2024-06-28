import { MessageRequest, MessageResponse } from "@yext/chat-core";

/**
 * Provides methods for interacting with Chat's AWS Connect integration.
 *
 * @public
 */
export interface ChatCoreAwsConnect {
  init(messageResponse: MessageResponse): Promise<void>;
  on(eventName: string, cb: EventListener): void;
  emit(eventName: string, data: any): void;
  processMessage(request: MessageRequest): Promise<void>;
  getSession(): connect.ActiveChatSession | undefined;
}
