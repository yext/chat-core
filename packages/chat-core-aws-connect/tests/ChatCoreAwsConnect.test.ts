import { provideChatCoreAwsConnect } from "../src/CoreAwsConnectProvider";
import { MessageResponse } from "@yext/chat-core";
import { LoggerConfig } from "../src/models/LoggerConfig";
import {
  AwsConnectEvent,
  AwsConnectEventData,
} from "../src/models/AwsConnectEvent";
import "amazon-connect-chatjs";

const createSpy = jest.fn().mockReturnValue(mockChatSession());
const globalConfigSpy = jest.fn();
let sess: connect.ActiveChatSession;

beforeAll(() => {
  global.window.connect = {
    ...global.window.connect,
    ChatSession: {
      ...global.window.connect.ChatSession,
      create: createSpy,
      setGlobalConfig: globalConfigSpy,
    },
  };
});

beforeEach(() => {
  jest.useFakeTimers();
  sess = mockChatSession();
  createSpy.mockReturnValue(sess);
});

afterEach(() => {
  jest.clearAllMocks();
});

function mockChatSession(): connect.ActiveCustomerChatSession {
  return {
    onMessage(_: (event: DeepPartial<AwsConnectEvent>) => void) {
      return null;
    },
    onEnded(_: (event: DeepPartial<AwsConnectEvent>) => void) {
      return null;
    },
    onTyping(_: (event: DeepPartial<AwsConnectEvent>) => void) {
      return null;
    },
    sendEvent() {
      return null;
    },
    sendMessage() {
      return null;
    },
    connect() {
      return { connectCalled: true, connectSuccess: true };
    },
    disconnectParticipant() {
      return null;
    },
  } as Partial<connect.ActiveCustomerChatSession> as connect.ActiveCustomerChatSession;
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
        region: "us-east-1",
      },
    },
  };
}

describe("chat session initialization", () => {
  it("returns an error when failing to connect to chat session", async () => {
    sess.connect = () => {
      return { connectCalled: true, connectSuccess: false };
    };

    const chatCoreAwsConnect = provideChatCoreAwsConnect();
    await expect(
      chatCoreAwsConnect.init(mockMessageResponse())
    ).rejects.toThrowError("Failed to connect to chat session");
  });

  it("returns no error when successfully connecting to chat session", async () => {
    const chatCoreAwsConnect = provideChatCoreAwsConnect();
    await expect(
      chatCoreAwsConnect.init(mockMessageResponse())
    ).resolves.toBeUndefined();
  });

  it("returns error when integration credentials are not specified", async () => {
    const messageResponse = mockMessageResponse();
    delete messageResponse.integrationDetails;

    const chatCoreAwsConnect = provideChatCoreAwsConnect();
    await expect(chatCoreAwsConnect.init(messageResponse)).rejects.toThrowError(
      "Integration credentials not specified. Cannot initialize chat session."
    );
  });

  it("logs warning when session already exists", async () => {
    const consoleWarnSpy = jest.spyOn(console, "warn").mockImplementation();
    const sendMessageSpy = jest.spyOn(sess, "sendMessage");

    const chatCoreAwsConnect = provideChatCoreAwsConnect();
    await chatCoreAwsConnect.init(mockMessageResponse());
    expect(consoleWarnSpy).not.toBeCalled();
    expect(sendMessageSpy).toBeCalledTimes(1);

    await chatCoreAwsConnect.init(mockMessageResponse());
    expect(consoleWarnSpy).toBeCalledWith("Chat session already initialized");
    expect(sendMessageSpy).toBeCalledTimes(1);
  });

  it("sends conversation summary message on chat session initialization", async () => {
    const sendMessageSpy = jest.spyOn(sess, "sendMessage");

    const chatCoreAwsConnect = provideChatCoreAwsConnect();
    await chatCoreAwsConnect.init(mockMessageResponse());

    expect(sendMessageSpy).toBeCalledWith({
      contentType: "text/plain",
      message: "SUMMARY: conversationSummary",
    });
  });
});

it("emits typing event", async () => {
  const sendEventSpy = jest.spyOn(sess, "sendEvent");

  const chatCoreAwsConnect = provideChatCoreAwsConnect();
  await chatCoreAwsConnect.init(mockMessageResponse());

  chatCoreAwsConnect.emit("typing", true);

  expect(sendEventSpy).toBeCalledWith({
    contentType: "application/vnd.amazonaws.connect.event.typing",
  });

  sendEventSpy.mockClear();
  chatCoreAwsConnect.emit("typing", false);

  expect(sendEventSpy).not.toBeCalled();
});

it("sends message on processMessage", async () => {
  const sendMessageSpy = jest.spyOn(sess, "sendMessage");

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

it("returns session on getSession", async () => {
  const chatCoreAwsConnect = provideChatCoreAwsConnect();
  await chatCoreAwsConnect.init(mockMessageResponse());

  expect(chatCoreAwsConnect.getSession()).toBe(sess);
});

it("uses logger config when provided", async () => {
  const loggerConfig: LoggerConfig = {
    level: "DEBUG",
    customizedLogger: {
      debug: jest.fn(),
    },
  };

  const chatCoreAwsConnect = provideChatCoreAwsConnect({ loggerConfig });
  await chatCoreAwsConnect.init(mockMessageResponse());

  expect(globalConfigSpy).toBeCalledWith({
    loggerConfig: {
      level: connect.LogLevel.DEBUG,
      useDefaultLogger: false,
      customizedLogger: loggerConfig.customizedLogger,
    },
    region: "us-east-1",
  });
});

type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};
type AwsEventCallback = (event: DeepPartial<AwsConnectEvent>) => void;

it("triggers message event callbacks", async () => {
  const onMessageSpy = jest.spyOn(sess, "onMessage");

  const chatCoreAwsConnect = provideChatCoreAwsConnect();
  await chatCoreAwsConnect.init(mockMessageResponse());

  const msgText = "hello world!";
  const dummyFn = jest.fn();
  chatCoreAwsConnect.on("message", (event: string) => {
    expect(event).toBe(msgText);
    dummyFn();
  });
  expect(onMessageSpy).toBeCalled();

  // get the parameter passed to the onMessage callback
  const onMessageFn = onMessageSpy.mock.calls[0][0] as AwsEventCallback;

  // simulate a message event
  onMessageFn({
    data: {
      ContentType: "text/plain",
      ParticipantRole: "AGENT",
      Content: msgText,
    },
  });

  expect(dummyFn).toBeCalled();
});

it("triggers close event callbacks", async () => {
  const onEndedSpy = jest.spyOn(sess, "onEnded");

  const chatCoreAwsConnect = provideChatCoreAwsConnect();
  await chatCoreAwsConnect.init(mockMessageResponse());

  const endEvent: DeepPartial<AwsConnectEvent> = {
    data: { ContentType: "text/plain", ParticipantRole: "AGENT", Type: "END" },
  };
  const dummyFn = jest.fn();
  chatCoreAwsConnect.on("close", (event: AwsConnectEventData) => {
    expect(event).toStrictEqual(endEvent.data);
    dummyFn();
  });
  expect(onEndedSpy).toBeCalled();

  // get the parameter passed to the onEnded callback
  const onEndedFn = onEndedSpy.mock.calls[0][0] as AwsEventCallback;

  // simulate an ended event
  onEndedFn({ ...endEvent });

  expect(dummyFn).toBeCalled();
});

it("triggers typing event callbacks", async () => {
  const onTypingSpy = jest.spyOn(sess, "onTyping");

  const chatCoreAwsConnect = provideChatCoreAwsConnect();
  await chatCoreAwsConnect.init(mockMessageResponse());

  const dummyFn = jest.fn();
  chatCoreAwsConnect.on("typing", (event: boolean) => {
    expect(event).toBe(true);
    dummyFn();
  });
  expect(onTypingSpy).toBeCalled();

  // get the parameter passed to the onTyping callback
  const onTypingFn = onTypingSpy.mock.calls[0][0] as AwsEventCallback;

  // simulate a typing event
  onTypingFn({ data: { ParticipantRole: "AGENT", Type: "TYPING" } });

  expect(dummyFn).toBeCalled();
});

it("sets a timeout to turn off typing indicator", async () => {
  jest.useFakeTimers();
  const onTypingSpy = jest.spyOn(sess, "onTyping");

  const chatCoreAwsConnect = provideChatCoreAwsConnect();
  await chatCoreAwsConnect.init(mockMessageResponse());

  const dummyFn = jest.fn();
  chatCoreAwsConnect.on("typing", dummyFn);

  // get the parameter passed to the onTyping callback
  const onTypingFn = onTypingSpy.mock.calls[0][0] as AwsEventCallback;

  // simulate a typing event
  onTypingFn({ data: { ParticipantRole: "AGENT", Type: "TYPING" } });

  expect(dummyFn).toBeCalledTimes(1);

  // advance time by 5s
  jest.advanceTimersByTime(5000);

  expect(dummyFn).toBeCalledTimes(2);
});

it("ignores non-agent messages", async () => {
  const onMessageSpy = jest.spyOn(sess, "onMessage");

  const chatCoreAwsConnect = provideChatCoreAwsConnect();
  await chatCoreAwsConnect.init(mockMessageResponse());

  const dummyFn = jest.fn();
  chatCoreAwsConnect.on("message", dummyFn);

  // get the parameter passed to the onMessage callback
  const onMessageFn = onMessageSpy.mock.calls[0][0] as AwsEventCallback;

  // simulate a message event
  onMessageFn({
    data: {
      ContentType: "text/plain",
      ParticipantRole: "CUSTOMER",
      Content: "hello world!",
    },
  });

  expect(dummyFn).not.toBeCalled();
});

it("ignores messages with non-text content type", async () => {
  const onMessageSpy = jest.spyOn(sess, "onMessage");

  const chatCoreAwsConnect = provideChatCoreAwsConnect();
  await chatCoreAwsConnect.init(mockMessageResponse());

  const dummyFn = jest.fn();
  chatCoreAwsConnect.on("message", dummyFn);

  // get the parameter passed to the onMessage callback
  const onMessageFn = onMessageSpy.mock.calls[0][0] as AwsEventCallback;

  // simulate a message event
  onMessageFn({
    data: {
      ContentType: "application/json",
      ParticipantRole: "AGENT",
      Content: "hello world!",
    },
  });

  expect(dummyFn).not.toBeCalled();
});

it("clear session on close event", async () => {
  const onEndedSpy = jest.spyOn(sess, "onEnded");

  const chatCoreAwsConnect = provideChatCoreAwsConnect();
  await chatCoreAwsConnect.init(mockMessageResponse());
  expect(chatCoreAwsConnect.getSession()).toBeDefined();

  // get the parameter passed to the onSpy callback
  const onEndedFn = onEndedSpy.mock.calls[0][0] as AwsEventCallback;

  // simulate a session close event
  onEndedFn({});
  expect(chatCoreAwsConnect.getSession()).toBeUndefined();
});

it("clears session on resetSession", async () => {
  const chatCoreAwsConnect = provideChatCoreAwsConnect();
  await chatCoreAwsConnect.init(mockMessageResponse());
  expect(chatCoreAwsConnect.getSession()).toBeDefined();

  chatCoreAwsConnect.resetSession();
  expect(chatCoreAwsConnect.getSession()).toBeUndefined();
});

it("noops when clearing undefined session", async () => {
  const chatCoreAwsConnect = provideChatCoreAwsConnect();
  expect(chatCoreAwsConnect.getSession()).toBeUndefined();

  chatCoreAwsConnect.resetSession();
  expect(chatCoreAwsConnect.getSession()).toBeUndefined();
});

it("throws error when session is not a customer session", async () => {
  const sess = {} as unknown as connect.ActiveChatSession;
  createSpy.mockReturnValue(sess);

  const chatCoreAwsConnect = provideChatCoreAwsConnect();
  expect(() => chatCoreAwsConnect.init(mockMessageResponse())).rejects.toThrow(
    "Unexpected non-customer chat session type"
  );
});
