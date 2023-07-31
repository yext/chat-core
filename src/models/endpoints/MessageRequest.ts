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
  /**
   * Additional information to pass into the instruction flow. This data could
   * then be used in the URL or body of a REST API step, influence Chat API's
   * assessment in a conditional step, or help construct a reply with additional
   * details.
   *
   * @remarks
   * May be any valid JSON object
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  context?: any;
  /**
   * promptPackage corresponds to the package of prompts which will be used
   * to carry out the instruction steps. When set to "nightly", the bot will
   * use the most recent updates to the prompts, which may include experimental
   * changes.
   * It is STRONGLY recommended to use the default "stable" for your bot.
   *
   * @remarks
   * The set of prompts which will be used by the bot's instruction steps.
   * Defaults to "stable", which is the set of tested and verified prompts.
   */
  promptPackage?: "stable" | "nightly";
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
  /** {@inheritdoc MessageRequest.promptPackage} */
  promptPackage?: "stable" | "nightly";
}
