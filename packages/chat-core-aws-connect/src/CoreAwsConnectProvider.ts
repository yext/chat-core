import { ChatCoreAwsConnectImpl } from "./infra/ChatCoreAwsConnectImpl";
import { ChatCoreAwsConnect } from "./models";

/**
 * Provider for the ChatCore integration with AWS Connect.
 *
 * @public
 */
export function provideChatCoreAwsConnect(): ChatCoreAwsConnect {
  return new ChatCoreAwsConnectImpl();
}
