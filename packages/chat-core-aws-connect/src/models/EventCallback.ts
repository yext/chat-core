import { AwsConnectEventData } from "./AwsConnectEvent";

/**
 * A generic event callback, to be used when defining listeners for a {@link ChatCoreAwsConnect}.
 *
 * @public
 */
export type EventCallback<T extends keyof EventMap> = (
  arg: EventMap[T]
) => void;

export type EventMap = {
  message: string;
  typing: boolean;
  close: AwsConnectEventData;
};
