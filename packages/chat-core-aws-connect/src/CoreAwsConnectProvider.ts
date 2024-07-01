import { ChatCoreAwsConnectImpl } from "./infra/ChatCoreAwsConnectImpl";
import { ChatCoreAwsConnect } from "./models";
import { LoggerConfig } from "./models/LoggerConfig";

/**
 * Provider for the ChatCore integration with AWS Connect.
 *
 * @param loggerConfig - Configuration for the logger. If not provided, the default logger will be used with level ERROR.
 *
 * @public
 */
export function provideChatCoreAwsConnect(
  loggerConfig?: LoggerConfig
): ChatCoreAwsConnect {
  return new ChatCoreAwsConnectImpl(loggerConfig);
}
