import { Message } from "./Message";
import { MessageNotes } from "./MessageNotes";

/**
 * A request to Chat API.
 *
 * @public
 */
export interface MessageRequest {
  /**
   * The id corresponds to the current conversation. This is generated
   * by the server on the first message of the conversation and returned
   * in {@link MessageResponse}.
   *
   * @remarks
   * The first request for a new conversation may omit this id, but subsequent
   * requests for the same conversation should include the same id returned in
   * the response.
   */
  conversationId?: string;
  /**
   * The messages of the current conversation.
   *
   * @remarks
   * The most recent message is the last message in the array,
   * in which Chat API will generate a reply for.
   */
  messages: Message[];
  /** {@inheritDoc MessageNotes} */
  notes?: MessageNotes;
}

/**
 * Represents the internal request format that Chat API expects.
 *
 * @internal
 */
export interface ApiMessageRequest {
  /** {@inheritdoc MessageRequest.conversationId} */
  conversationId?: string;
  /** {@inheritDoc ChatConfig.version} */
  version?: "STAGING" | "PRODUCTION" | number;
  /** {@inheritDoc MessageRequest.messages} */
  messages: Message[];
  /** {@inheritDoc MessageNotes} */
  notes?: MessageNotes;
}
