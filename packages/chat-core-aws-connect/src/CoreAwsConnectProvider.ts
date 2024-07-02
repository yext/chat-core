import { ChatCoreAwsConnectImpl } from "./infra/ChatCoreAwsConnectImpl";
import { ChatCoreAwsConnect, ChatCoreAwsConnectConfig } from "./models";

/**
 * Provider for the ChatCore integration with AWS Connect.
 *
 * @param config - Configuration for the returned instance of the {@link ChatCoreAwsConnect}.
 *
 * @public
 */
export function provideChatCoreAwsConnect(
  config?: ChatCoreAwsConnectConfig
): ChatCoreAwsConnect {
  return new ChatCoreAwsConnectImpl(config);
}
