import { Region } from "./endpoints/Region";
import { Environment } from "./endpoints/Environment";
import { EnumOrLiteral } from "./utils/EnumOrLiteral";
import { Endpoints } from "./endpoints/Endpoints";

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
   * Default to 'STAGING' in Chat API
   *
   * @example
   * Examples: 'STAGING', 'PRODUCTION', '42'
   */
  version?: string;
  /**
   * Defines the environment of the API domains.
   *
   * @remarks
   * Default to PRODUCTION.
   */
  env?: EnumOrLiteral<Environment>;
  /**
   * The region to send the requests to.
   *
   * @remarks
   * Defaults to 'US'.
   */
  region?: EnumOrLiteral<Region>;
  /** Overrides for the URLs which are used when making requests to the Chat API. */
  endpoints?: Endpoints;
}
