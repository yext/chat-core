/**
 * Returns true if the Amazon connect chat session is a customer chat session.
 * @param session - The Amazon connect chat session.
 *
 * @internal
 */
export function isCustomerChatSession(
  session: connect.ActiveChatSession
): session is connect.ActiveCustomerChatSession {
  return (
    (session as connect.ActiveCustomerChatSession).disconnectParticipant !==
    undefined
  );
}
