/**
 * Represents a message within a conversation
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
  */
export enum MessageSource {
  USER = 'USER',
  BOT = 'BOT'
}
