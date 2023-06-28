import { ChatConfig } from "../ChatConfig";

/**
 * Configuration to construct Chat API endpoints.
 *
 * @internal
 */
export type EndpointConfig = Pick<
  ChatConfig,
  "botId" | "businessId" | "env" | "region"
>;
