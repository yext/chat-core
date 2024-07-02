import { LoggerConfig } from "./LoggerConfig";

/**
 * Configuration for this instance of the {@link ChatCoreAwsConnect}.
 *
 * @public
 */
export interface ChatCoreAwsConnectConfig {
  /**
   * Configuration for the internal logger of the AWS Connect Chat session.
   */
  loggerConfig: LoggerConfig;
}
