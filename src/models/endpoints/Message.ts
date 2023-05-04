/**
 * Represents a message within a conversation.
 *
 * @public
 */
export interface Message {
  /** Time when the message is sent. */
  timestamp: number,
  /** The sender of the message. */
  source: MessageSource,
  /** The message's content. */
  text: string
}

/**
 * Types of sender of a message.
 *
 * @public
 */
export enum MessageSource {
  /** From a user. */
  USER = 'USER',
  /** From Chat API server. */
  BOT = 'BOT'
}
