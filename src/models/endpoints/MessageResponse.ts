import { Message } from "./Message";
import { MessageNotes } from "./MessageNotes";

/**
 * A response from Chat API.
 *
 * @public
 */
export interface MessageResponse {
  /** The id corresponds to the current conversation. */
  conversationId: string;
  /** The generated reply to the latest message in the request. */
  message: Message;
  /** {@inheritDoc MessageNotes} */
  notes: MessageNotes;
  /** The response's id in the form of a 26 character ULID */
  responseId: string;
}
