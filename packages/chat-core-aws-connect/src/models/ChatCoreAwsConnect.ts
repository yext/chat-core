import { MessageRequest, MessageResponse } from "@yext/chat-core";
import { EventCallback, EventMap } from "./EventCallback";

/**
 * Provides methods for interacting with Chat's Amazon Connect integration.
 *
 * @public
 */
export interface ChatCoreAwsConnect {
  /**
   * Initialize the Amazon Connect chat session using the credentials from the Chat API.
   *
   * @param messageResponse - The response returned from a successful call to the Chat API.
   */
  init(messageResponse: MessageResponse): Promise<void>;

  /**
   * Register a callback for an event triggered within the Amazon Connect chat session.
   * Supported events are:
   * - `message`: A new message has been received.
   * - `typing`: The agent is typing.
   * - `close`: The chat session has been closed.
   *
   * @param eventName - The name of the event to listen for.
   * @param cb - The callback to be executed when the event is triggered.
   */
  on<T extends keyof EventMap>(eventName: T, cb: EventCallback<T>): void;

  /**
   * Emit an event into the Amazon Connect chat session.
   * Supported events are:
   * - `typing`: The customer is typing.
   *
   * @param eventName - The name of the event to emit.
   * @param data - The data to be sent with the event.
   */
  emit<T extends keyof EventMap>(eventName: T, data: EventMap[T]): void;

  /**
   * Process a message sent by the user.
   *
   * @param request - The message sent by the user, in the Chat API format.
   */
  processMessage(request: MessageRequest): Promise<void>;

  /**
   * Get the current Amazon Connect chat session.
   *
   * @remarks
   * If the session is not initialized, this method will return `undefined`.
   */
  getSession(): connect.ActiveChatSession | undefined;

  /**
   * Resets the {@link ChatCoreAwsConnect} instance, clearing the underlying Amazon Connect session.
   */
  resetSession(): void;

  /**
   * Reinitialize the session using existing session data.
   *
   * @param credentials - The credentials to use to reinitialize the session.
   *
   * @remarks
   * This is currently not supported for Amazon Connect.
   */
  reinitializeSession(_: unknown): Promise<void>;
}
