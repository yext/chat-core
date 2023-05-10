/**
 * Information relevant to the current state of the conversation, serving as the bot’s
 * "memory" regarding what work it previously did to help determine future actions.
 *
 * @remarks
 * This data will come from the API. As such, a user’s first request may have this as undefined.
 * Subsequent requests will use the data of this type from the previous response.
 *
 * @public
 */
export interface MessageNotes {
  /** The goal of the latest message. */
  currentGoal?: string;
  /** The indices to traversed within the nested instruction array to access the target step. */
  currentStepIndices?: number[];
  /** The query used for Yext Search, REST api, etc. */
  searchQuery?: string;
  /** Data retrieved from Yext Search, REST api, etc. */
  queryResult?: object;
  /** Data collected from user in a conversation. */
  collectedData?: Record<string, unknown>;
  /** The index of the message that started the current goal. */
  goalFirstMsgIndex?: number;
}
