import { ChatCoreImpl } from "./infra/ChatCoreImpl";
import { ChatConfig, InternalConfig, ChatCore } from "./models";

/**
 * Provider for the ChatCore library. This is a test
 *
 * @public
 */
export function provideChatCore(config    : ChatConfig  ): ChatCore {
  return new ChatCoreImpl(config)
}

/**
 * Provider for the ChatCore library with additional internal-only configuration
 *
 * @internal
 */
export function provideChatCoreInternal(
  config: ChatConfig,
  internal: InternalConfig
): ChatCore {
  return new ChatCoreImpl(config, internal);
}
