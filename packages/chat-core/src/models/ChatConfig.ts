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
   * Default to 'LATEST' in Chat API
   *
   * @example
   * Examples: 'LATEST', 'STAGING', 'PRODUCTION', '42'
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
  /**
   * An optional location override to use instead of the user's provided location.
   *
   * @remarks
   * If provided, Search steps will not attempt to infer the location from
   * the request data and will use this latitude and longitude instead.
   */
  locationOverride?: { latitude: number; longitude: number };
}
