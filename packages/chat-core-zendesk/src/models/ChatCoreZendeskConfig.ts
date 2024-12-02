/**
 * Configuration for this instance of the {@link ChatCoreZendesk}.
 *
 * @public
 */
export interface ChatCoreZendeskConfig {
  /**
   * The web widget integration ID for the Zendesk chat.
   */
  integrationId: string;
  /**
   * Tags to apply when handoff to Zendesk is initiated.
   */
  ticketTags?: string[];
}
