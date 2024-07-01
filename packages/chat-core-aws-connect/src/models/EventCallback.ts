import { AwsConnectEventData } from "./AwsConnectEvent";

/**
 * A generic event callback, to be used when defining listeners for a {@link ChatCoreAwsConnect}.
 *
 * @public
 */
export type EventCallback<T extends keyof EventMap> = (
  arg: EventMap[T]
) => void;

/**
 * A map of events that can be emitted or listened for within a {@link ChatCoreAwsConnect} to their associated data types.
 *
 * @public
 */
export type EventMap = {
  message: string;
  typing: boolean;
  close: AwsConnectEventData;
};
