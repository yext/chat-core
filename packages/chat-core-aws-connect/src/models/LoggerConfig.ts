/**
 * Configuration for the internal logger of the AWS Connect Chat session.
 *
 * @public
 */
export type LoggerConfig = {
  /**
   * The log level for the logger. Can be one of DEBUG, INFO, WARN, ERROR, ADVANCED_LOG. Default is ERROR.
   */
  level: keyof typeof connect.LogLevel;
  /**
   * The custom logger to use. If provided, the default logger will be disabled.
   */
  customizedLogger?: connect.Logger;
};
