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
  /**
   * The JWT token to authenticate the user with Zendesk.
   * 
   * @remarks
   * Should be provided along with the {@link ChatCoreZendeskConfig.externalId} to authenticate the user.
   */
  jwt?: string;
  /**
   * The external ID to associate with the user in Zendesk.
   * 
   * @remarks
   * Should be provided along with the {@link ChatCoreZendeskConfig.jwt} token to authenticate the user.
   */
  externalId?: string;
  /**
   * Callback to be invoked when the authentication token is invalid.
   * The returned string will be used as the new auth token when retrying the request.
   */
  onInvalidAuth?: () => string | Promise<string>;
}
