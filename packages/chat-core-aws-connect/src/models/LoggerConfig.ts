/**
 * Configuration for the internal logger of the AWS Connect Chat session.
 *
 * @public
 */
export interface LoggerConfig {
  /**
   * The log level for the logger. Can be one of DEBUG, INFO, WARN, ERROR, ADVANCED_LOG. Default is ERROR.
   */
  level: LogLevel;
  /**
   * The custom logger to use. If provided, the default logger will be disabled.
   */
  customizedLogger?: Logger;
}

/**
 * The log level for the logger.
 *
 * @remarks
 * Only DEBUG, INFO, WARN, ERROR, ADVANCED_LOG are supported.
 * Setting only applies while the AWS Connect chat session is active.
 *
 * @public
 */
export type LogLevel = "DEBUG" | "INFO" | "WARN" | "ERROR" | "ADVANCED_LOG";

/**
 * The logger interface for the AWS Connect Chat session.
 *
 * @public
 */
export type Logger = {
  /**
   * Handler for log messages output at the `DEBUG` level.
   *
   * @param log - The incoming log message.
   */
  debug?: (log: string) => void;
  /**
   * Handler for log messages output at the `INFO` level.
   *
   * @param log - The incoming log message.
   */
  info?: (log: string) => void;
  /**
   * Handler for log messages output at the `WARN` level.
   *
   * @param log - The incoming log message.
   */
  warn?: (log: string) => void;
  /**
   * Handler for log messages output at the `ERROR` level.
   *
   * @param log - The incoming log message.
   */
  error?: (log: string) => void;
  /**
   * Handler for log messages output at the `ADVANCED_LOG` level.
   *
   * @param log - The incoming log message.
   */
  advancedLog?: (log: string) => void;
};
