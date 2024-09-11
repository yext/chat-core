import { ChatCoreZendeskImpl } from "./infra/ChatCoreZendeskImpl";
import { ChatCoreZendeskConfig } from "./models";

/**
 * Provider for the ChatCore integration with Zendesk.
 *
 * @param config - Configuration for the returned instance of the {@link ChatCoreZendesk}.
 *
 * @public
 */
export function provideChatCoreZendesk(config: ChatCoreZendeskConfig) {
  return new ChatCoreZendeskImpl(config);
}
