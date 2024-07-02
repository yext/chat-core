/**
 * An event returned by an AWS Connect callback.
 *
 * @internal
 */
export interface AwsConnectEvent {
  data: AwsConnectEventData;
}

/**
 * Data associated with an AWS Connect event.
 *
 * @public
 */
export interface AwsConnectEventData {
  /**
   * The time at which the event occurred.
   */
  AbsoluteTime: string;
  /**
   * The ID of the AWS Connect contact associated with the event.
   */
  ContactId: string;
  /**
   * The content of the event.
   */
  Content: string;
  /**
   * The type of content in the event.
   */
  ContentType: string;
  /**
   * The display name of the participant associated with the event.
   */
  DisplayName: string;
  /**
   * The ID of the event.
   */
  Id: string;
  /**
   * The ID of the participant associated with the event.
   */
  ParticipantId: string;
  /**
   * The role of the participant associated with the event.
   */
  ParticipantRole: string;
  /**
   * The type of the event.
   */
  Type: string;
}
