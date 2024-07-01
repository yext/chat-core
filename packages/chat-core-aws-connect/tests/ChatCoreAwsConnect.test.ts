import { provideChatCoreAwsConnect } from "../src";
import { MessageResponse } from "@yext/chat-core";

function mockChatSession(
  overrider: Partial<connect.ActiveChatSession> = {}
): connect.ActiveChatSession {
  return {
    onMessage(cb: (event: any) => void) {
      cb({ data: { ContentType: "text/plain", ParticipantRole: "AGENT" } });
    },
    onEnded(cb: (event: any) => void) {
      cb({ data: { ContentType: "text/plain", ParticipantRole: "AGENT" } });
    },
    onTyping(cb: (event: any) => void) {
      cb({ data: { ContentType: "text/plain", ParticipantRole: "AGENT" } });
    },
    sendEvent(event: any) {},
    sendMessage(message: any) {},
    connect(v: any) {
      return { connectCalled: true, connectSuccess: true };
    },
    ...overrider,
  } as unknown as connect.ActiveChatSession;
}

function mockMessageResponse(): MessageResponse {
  return {
    notes: {
      conversationSummary: "conversationSummary",
    },
    message: {
      source: "BOT",
      text: "text",
    },
    integrationDetails: {
      awsConnectHandoff: {
        credentials: {
          contactId: "contactId",
          participantId: "participantId",
          participantToken: "participantToken",
        },
      },
    },
  };
}

it("returns an error when failing to connect to chat session", async () => {
  const overrider = {
    connect(v: any) {
      return { connectCalled: true, connectSuccess: false };
    },
  };

  window.connect = {
    ...window.connect,
    ChatSession: {
      ...window.connect.ChatSession,
      create: jest.fn().mockReturnValue(mockChatSession(overrider)),
      setGlobalConfig: jest.fn(),
    },
  };

  const chatCoreAwsConnect = provideChatCoreAwsConnect();
  await expect(
    chatCoreAwsConnect.init(mockMessageResponse())
  ).rejects.toThrowError("Failed to connect to chat session");
});

it("returns no error when successfully connecting to chat session", async () => {
  window.connect = {
    ...window.connect,
    ChatSession: {
      ...window.connect.ChatSession,
      create: jest.fn().mockReturnValue(mockChatSession()),
      setGlobalConfig: jest.fn(),
    },
  };

  const chatCoreAwsConnect = provideChatCoreAwsConnect();
  await expect(
    chatCoreAwsConnect.init(mockMessageResponse())
  ).resolves.toBeUndefined();
});

it("sends conversation summary message on chat session initialization", async () => {
  const sess = mockChatSession();
  const sendMessageSpy = jest.spyOn(sess, "sendMessage");

  window.connect = {
    ...window.connect,
    ChatSession: {
      ...window.connect.ChatSession,
      create: jest.fn().mockReturnValue(sess),
      setGlobalConfig: jest.fn(),
    },
  };

  const chatCoreAwsConnect = provideChatCoreAwsConnect();
  await chatCoreAwsConnect.init(mockMessageResponse());

  expect(sendMessageSpy).toBeCalledWith({
    contentType: "text/plain",
    message: "conversationSummary",
  });
});

it("emits typing event", async () => {
  const sess = mockChatSession();
  const sendEventSpy = jest.spyOn(sess, "sendEvent");

  window.connect = {
    ...window.connect,
    ChatSession: {
      ...window.connect.ChatSession,
      create: jest.fn().mockReturnValue(sess),
      setGlobalConfig: jest.fn(),
    },
  };

  const chatCoreAwsConnect = provideChatCoreAwsConnect();
  await chatCoreAwsConnect.init(mockMessageResponse());

  chatCoreAwsConnect.emit("typing", {});

  expect(sendEventSpy).toBeCalledWith({
    contentType: "application/vnd.amazonaws.connect.event.typing",
  });
});

it("sends message on processMessage", async () => {
  const sess = mockChatSession();
  const sendMessageSpy = jest.spyOn(sess, "sendMessage");

  window.connect = {
    ...window.connect,
    ChatSession: {
      ...window.connect.ChatSession,
      create: jest.fn().mockReturnValue(sess),
      setGlobalConfig: jest.fn(),
    },
  };

  const chatCoreAwsConnect = provideChatCoreAwsConnect();
  await chatCoreAwsConnect.init(mockMessageResponse());

  const msg = "hello world!";
  await chatCoreAwsConnect.processMessage({
    messages: [
      {
        source: "USER",
        text: msg,
      },
    ],
  });

  expect(sendMessageSpy).toBeCalledWith({
    contentType: "text/plain",
    message: msg,
  });
});

it("logs warning when session already exists", async () => {
  const sess = mockChatSession();
  const consoleWarnSpy = jest.spyOn(console, "warn");

  window.connect = {
    ...window.connect,
    ChatSession: {
      ...window.connect.ChatSession,
      create: jest.fn().mockReturnValue(sess),
      setGlobalConfig: jest.fn(),
    },
  };

  const chatCoreAwsConnect = provideChatCoreAwsConnect();
  await chatCoreAwsConnect.init(mockMessageResponse());
  await chatCoreAwsConnect.init(mockMessageResponse());

  expect(consoleWarnSpy).toBeCalledWith("Chat session already initialized");
});
