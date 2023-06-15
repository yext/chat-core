/**
 * The configuration options for {@link ChatCore}.
 *
 * @public
 */
export interface ChatConfig {
  /** ID of the bot to interface with. */
  botId: string;
  /** The api key of the Chat experience. */
  apiKey: string;
  /** ID of the account associated with this chat bot. */
  businessId?: number;
  /**
   * The version of the chat bot configuration.
   *
   * @remarks
   * May be a configuration label (string) or a configuration version (number).
   * Default to 'STAGING'
   *
   * @example
   * Examples: 'STAGING', 42
   */
  version?: "STAGING" | "PRODUCTION" | number;
  /**
   * Domain to use for the URL endpoints.
   *
   * @remarks
   * Default to liveapi.yext.com
   */
  apiDomain?: string;
}
