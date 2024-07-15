import { EnumOrLiteral } from "../utils/EnumOrLiteral";

/**
 * Represents a message within a conversation.
 *
 * @public
 */
export interface Message {
  /**
   * The response's id in the form of a 26 character ULID.
   * This is present for message coming from server.
   */
  responseId?: string;
  /** Time when the message is sent. */
  timestamp?: string;
  /** The sender of the message. */
  source: EnumOrLiteral<MessageSource>;
  /** The message's content. */
  text: string;
}

/**
 * Types of sender of a message.
 *
 * @public
 */
export enum MessageSource {
  /** From a user. */
  USER = "USER",
  /** From Chat API server. */
  BOT = "BOT",
  /** From third-party integration. */
  AGENT = "AGENT",
}
