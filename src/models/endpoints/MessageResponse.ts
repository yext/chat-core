import { Message } from './Message';
import { MessageNotes } from './MessageNotes';

/**
 * A response from Chat API.
 *
 * @public
 */
export interface MessageResponse {
  /** The generated reply to the latest message in the request. */
  message: Message,
  /** {@inheritDoc MessageNotes} */
  notes: MessageNotes
}
