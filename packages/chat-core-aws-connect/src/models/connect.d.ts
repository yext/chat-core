import { ChatSession as AwsChatSession } from "amazon-connect-chatjs";

declare global {
    namespace connect {
        const ChatSession: typeof AwsChatSession;
        const LogLevel: typeof AwsChatSession.LogLevel;
        export type ActiveChatSession = ReturnType<typeof connect.ChatSession.create>;
    }
}