import { ChatCore } from "./ChatCore";
import { ChatConfig, InternalConfig } from "./models";

/**
 * Provider for the ChatCore library
 * @public
 */
export function ProvideChatCore(config: ChatConfig): ChatCore {
  return new ChatCore(config);
}

/**
 * Provider for the ChatCore library with additional internal-only configuration
 * @internal
 */
export function ProvideChatCoreInternal(
  config: ChatConfig,
  internal: InternalConfig
): ChatCore {
  return new ChatCore(config, internal);
}
