/**
 * Configurations for Zendesk handoff.
 *
 * @public
 */
export interface ZendeskHandoff {
    /**
     * A serialized JSON string of ticket fields to be automatically set 
     * when initiating Zendesk handoff.
     */
    ticketFields?: string;
}
