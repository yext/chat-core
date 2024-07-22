
interface InitOptions {
    integrationId: string,
    embedded?: boolean,
    soundNotificationEnabled?: boolean,
}


declare module 'smooch';

// declare module 'smooch' {
//     const smooch: _smooch
//     export default smooch;
// }

// interface _smooch {
//     init(config: InitOptions): any;
//     render(element: HTMLElement): void;
//     // see https://github.com/zendesk/sunshine-conversations-web for more info
//     on(event: string, callback: (...arg: any) => void): void;
//     startTyping(): void;
//     stopTyping(): void;
//     sendMessage(message: string, conversationId: string): void;
//     createConversation(): Promise<any>;
// }
