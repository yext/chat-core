import { ChatSession as AwsChatSession } from "amazon-connect-chatjs";

declare global {
    namespace connect {
        var ChatSession: typeof AwsChatSession;
        var LogLevel: typeof AwsChatSession.LogLevel;
        export type ActiveChatSession = ReturnType<typeof connect.ChatSession.create>;
    }
}