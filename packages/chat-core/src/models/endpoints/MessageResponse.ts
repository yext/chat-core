import { IntegrationDetails } from "../integrations/IntegrationDetails";
import { Message } from "./Message";
import { MessageNotes } from "./MessageNotes";

/**
 * A response from Chat API.
 *
 * @public
 */
export interface MessageResponse {
  /**
   * The id corresponds to the current conversation.
   *
   * @remarks
   * This is undefined only when it's an initial bot response without any user message present.
   */
  conversationId?: string;
  /** The generated reply to the latest message in the request. */
  message: Message;
  /** {@inheritDoc MessageNotes} */
  notes: MessageNotes;
  /** {@inheritdoc IntegrationDetails} */
  integrationDetails?: IntegrationDetails;
}
