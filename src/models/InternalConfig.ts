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
  /**
   * promptPackage corresponds to the package of prompts which will be used
   * to carry out the instruction steps. When set to "nightly", the bot will
   * use the most recent updates to the prompts, which may include experimental
   * changes.
   * It is STRONGLY recommended to use the default "stable" for your bot.
   *
   * @remarks
   * The set of prompts which will be used by the bot's instruction steps.
   * Defaults to "stable", which is the set of tested and verified prompts.
   */
  promptPackage?: ChatPrompt;
  /**
   * Modes to determine types of models to use when sending requests the bot's
   * instruction steps.
   */
  aiMode?: string;
}
