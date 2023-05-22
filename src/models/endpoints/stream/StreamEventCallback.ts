import { StreamEvent } from "./StreamEvent";

/**
 * A function to execute when a {@link StreamEvent} occur.
 *
 * @public
 */
export type StreamEventCallback = (event: StreamEvent) => void;
