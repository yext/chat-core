/**
 * Configurations for AWS Connect handoff.
 *
 * @public
 */
export interface AwsConnectHandoff {
  /** {@inheritdoc AwsConnectCredentials} */
  credentials: AwsConnectCredentials;
  /** The region of The AWS Connect instance. */
  region: string;
}

/**
 * AWS Connect handoff credentials.
 *
 * @public
 */
export interface AwsConnectCredentials {
  /** The identifier of an AWS chat session. */
  contactId: string;
  /** The identifier for a chat participant in AWS Connect. */
  participantId: string;
  /**
   * The token used by the chat participant create connection.
   *
   * @remarks
   * The participant token is valid for the lifetime of a chat participant.
   */
  participantToken: string;
}
