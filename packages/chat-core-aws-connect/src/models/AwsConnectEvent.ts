/**
 * An event returned by an AWS Connect callback.
 *
 * @internal
 */
export interface AwsConnectEvent {
  data: {
    AbsoluteTime: string;
    ContactId: string;
    Content: string;
    ContentType: string;
    DisplayName: string;
    Id: string;
    ParticipantId: string;
    ParticipantRole: string;
    RelatedContactId: string;
    Type: string;
  };
}
