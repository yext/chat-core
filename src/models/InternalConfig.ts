/**
 * The type of prompts to be used by the Chat bot.
 * Experimental changes to prompts will be applied to the "nightly"
 * package and subsequently moved into "stable" after performance and
 * reliability are verified. It is STRONGLY recommended not to use
 * "nightly" in production Chat bots.
 * 
 * @internal
 */
export type ChatPrompt = "stable" | "nightly";

/**
 * Experimental or internal-only features for Chat Core
 * @internal
 */
export interface InternalConfig {
  promptPackage?: ChatPrompt;
}
