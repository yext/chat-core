import { Message } from './Message';
import { MessageNotes } from './MessageNotes';

/**
 * A request to Chat API
 *
 * @public
 */
export interface MessageRequest {
  /**
   * The messages of the current conversation.
   *
   * @remarks
   * The most recent message is the last message in the array,
   * in which Chat API will generate a reply for
   */
  messages: Message[],
  /** {@inheritDoc MessageNotes} */
  notes?: MessageNotes
}

/**
 * Represents the internal request format that Chat API expects
 *
 * @internal
 */
export interface ApiMessageRequest {
  /** {@inheritDoc ChatConfig.version} */
  version?: 'STAGING' | 'PRODUCTION' | number,
  /** {@inheritDoc MessageRequest.messages} */
  messages: Message[],
  /** {@inheritDoc MessageNotes} */
  notes?: MessageNotes
}
