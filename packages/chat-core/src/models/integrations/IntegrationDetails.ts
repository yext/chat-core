import { AwsConnectHandoff } from "./AwsConnect";
import { ZendeskHandoff } from "./Zendesk";

/**
 * Integration details for the current conversation.
 *
 * @public
 *
 * @remarks
 * This is only present when the conversation is integrated with a third-party service, such as AWS Connect and Zendesk.
 */
export interface IntegrationDetails {
  /** {@inheritdoc AwsConnectHandoff} */
  awsConnectHandoff?: AwsConnectHandoff;
  /** {@inheritdoc ZendeskHandoff} */
  zendeskHandoff?: ZendeskHandoff;
}
