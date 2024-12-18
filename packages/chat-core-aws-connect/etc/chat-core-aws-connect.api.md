## API Report File for "@yext/chat-core-aws-connect"

> Do not edit this file. It is a report generated by [API Extractor](https://api-extractor.com/).

```ts

import { MessageRequest } from '@yext/chat-core';
import { MessageResponse } from '@yext/chat-core';

// @public
export interface AwsConnectEventData {
    AbsoluteTime: string;
    ContactId: string;
    Content: string;
    ContentType: string;
    DisplayName: string;
    Id: string;
    ParticipantId: string;
    ParticipantRole: string;
    Type: string;
}

// @public
export interface ChatCoreAwsConnect {
    emit<T extends keyof EventMap>(eventName: T, data: EventMap[T]): void;
    getSession(): connect.ActiveChatSession | undefined;
    init(messageResponse: MessageResponse): Promise<void>;
    on<T extends keyof EventMap>(eventName: T, cb: EventCallback<T>): void;
    processMessage(request: MessageRequest): Promise<void>;
    reinitializeSession(_: unknown): Promise<void>;
    resetSession(): void;
}

// @public
export interface ChatCoreAwsConnectConfig {
    loggerConfig: LoggerConfig;
}

// @public
export type EventCallback<T extends keyof EventMap> = (arg: EventMap[T]) => void;

// @public
export type EventMap = {
    message: string;
    typing: boolean;
    close: AwsConnectEventData;
};

// @public
export type Logger = {
    debug?: (log: string) => void;
    info?: (log: string) => void;
    warn?: (log: string) => void;
    error?: (log: string) => void;
    advancedLog?: (log: string) => void;
};

// @public
export interface LoggerConfig {
    customizedLogger?: Logger;
    level: LogLevel;
}

// @public
export type LogLevel = "DEBUG" | "INFO" | "WARN" | "ERROR" | "ADVANCED_LOG";

// @public
export function provideChatCoreAwsConnect(config?: ChatCoreAwsConnectConfig): ChatCoreAwsConnect;

// (No @packageDocumentation comment for this package)

```
