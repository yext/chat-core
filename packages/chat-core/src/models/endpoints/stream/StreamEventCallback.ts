import { EnumOrLiteral } from "../../utils/EnumOrLiteral";
import { StreamEvent, StreamEventName } from "./StreamEvent";

/**
 * A function to execute when a {@link StreamEvent} occurs.
 *
 * @public
 */
export type StreamEventCallback<T extends string = StreamEventName> = (
  event: Extract<StreamEvent, { event: EnumOrLiteral<T> }>
) => void;
