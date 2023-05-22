import { EnumOrLiteral } from "../../utils/EnumOrLiteral";
import { MessageNotes } from "../MessageNotes";
import { MessageResponse } from "../MessageResponse";

/**
 * Types of stream events returned from Chat Stream API.
 * 
 * @public
 */
export type StreamEvent = StartEvent | TokenStreamEvent | EndEvent;

/**
 * Names of stream events returned from Chat Stream API.
 * 
 * @public
 */
export enum StreamEventName {
  /** {@inheritdoc StartEvent} */
  StartEvent = "startTokenStream",
  /** {@inheritdoc TokenStreamEvent} */
  TokenStreamEvent = "streamToken",
  /** {@inheritdoc EndEvent} */
  EndEvent = "endStream",
}

/**
 * An event that indicates start of Chat stream.
 * 
 * @public
 */
export interface StartEvent {
  /** Name of the event. */
  event: EnumOrLiteral<StreamEventName.StartEvent>;
  /** {@inheritdoc MessageNotes} */
  data: MessageNotes;
}

/**
 * An event that carries a partial response.
 * 
 * @public
 */
export interface TokenStreamEvent {
  /** Name of the event. */
  event: EnumOrLiteral<StreamEventName.TokenStreamEvent>;
  /** Chunk of data returned from stream response. */
  data: string;
}

/**
 * An event that indicates end of Chat stream.
 * 
 * @public
 */
export interface EndEvent {
  /** Name of the event. */
  event: EnumOrLiteral<StreamEventName.EndEvent>;
  /** Full response from Chat API. */
  data: MessageResponse;
}
