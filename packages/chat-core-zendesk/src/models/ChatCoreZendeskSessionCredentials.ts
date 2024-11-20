/**
 * Credentials for the Zendesk session created by the {@link ChatCoreZendesk}.
 * Used for reinitializing the session across page reloads.
 *
 * @public
 */
export interface ChatCoreZendeskSessionCredentials {
  /**
   * The conversation ID for the current chat session.
   */
  conversationId: string;
}
