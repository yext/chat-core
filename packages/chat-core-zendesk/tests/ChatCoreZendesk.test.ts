/* eslint-disable @typescript-eslint/no-explicit-any */
import { ChatCoreZendeskConfig, provideChatCoreZendesk } from "../src/index";
import { MessageResponse } from "@yext/chat-core";
import * as SmoochLib from "smooch";

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
      zendeskHandoff: {
        ticketFields: '{"field1": "value1", "field2": "value2"}',
      },
    },
  };
}

const mockConfig: ChatCoreZendeskConfig = {
  integrationId: "mock-integration-id",
};
const mockConversationId = "mock-conversation-id";
jest.mock("smooch", () => ({
  render: jest.fn(),
  init: jest.fn(),
  createConversation: jest.fn(),
  loadConversation: jest.fn(),
  sendMessage: jest.fn(),
  on: jest.fn(),
  startTyping: jest.fn(),
  stopTyping: jest.fn(),
  off: jest.fn(),
}));

beforeEach(() => {
  jest
    .mocked(SmoochLib.createConversation)
    .mockResolvedValue({ id: mockConversationId } as Conversation);
  document.body.innerHTML = "";
});

describe("chat session initialization", () => {
  it("returns an error when failing to connect to chat session", async () => {
    jest
      .mocked(SmoochLib.init)
      .mockRejectedValue(new Error("Failed to connect to chat session"));
    jest.spyOn(console, "error").mockImplementation();
    const chatCoreZendesk = provideChatCoreZendesk(mockConfig);
    await expect(chatCoreZendesk.init(mockMessageResponse())).rejects.toThrow(
      "Failed to connect to chat session"
    );
    expect(console.error).toBeCalledWith(
      "Zendesk SDK init error",
      expect.any(Error)
    );
  });

  it("returns convo id and no error when successfully connecting to chat session", async () => {
    const chatCoreZendesk = provideChatCoreZendesk(mockConfig);
    await expect(
      chatCoreZendesk.init(mockMessageResponse())
    ).resolves.toStrictEqual({ conversationId: "mock-conversation-id" });
  });

  it("avoid rendering smooch web widget on subsequent initialization", async () => {
    const renderSpy = jest.spyOn(SmoochLib, "render");
    const chatCoreZendesk = provideChatCoreZendesk(mockConfig);
    await chatCoreZendesk.init(mockMessageResponse());
    expect(renderSpy).toBeCalledTimes(1);
    await chatCoreZendesk.init(mockMessageResponse());
    expect(renderSpy).toBeCalledTimes(1);
  });

  it("setup new conversation session on each initialization", async () => {
    const createConversationSpy = jest.spyOn(SmoochLib, "createConversation");
    const chatCoreZendesk = provideChatCoreZendesk(mockConfig);
    await chatCoreZendesk.init(mockMessageResponse());
    expect(createConversationSpy).toBeCalledTimes(1);
    await chatCoreZendesk.init(mockMessageResponse());
    expect(createConversationSpy).toBeCalledTimes(2);
  });

  it("sends conversation summary message on chat session initialization", async () => {
    const sendMessageSpy = jest.spyOn(SmoochLib, "sendMessage");
    const chatCoreZendesk = provideChatCoreZendesk(mockConfig);
    await chatCoreZendesk.init(mockMessageResponse());
    expect(sendMessageSpy).toBeCalledWith(
      "SUMMARY: conversationSummary",
      mockConversationId
    );
  });
});

it("emits typing event", async () => {
  const startTypingSpy = jest.spyOn(SmoochLib, "startTyping");
  const stopTypingSpy = jest.spyOn(SmoochLib, "stopTyping");
  const chatCoreZendesk = provideChatCoreZendesk(mockConfig);
  await chatCoreZendesk.init(mockMessageResponse());

  chatCoreZendesk.emit("typing", true);
  expect(startTypingSpy).toBeCalledTimes(1);
  expect(stopTypingSpy).toBeCalledTimes(0);

  chatCoreZendesk.emit("typing", false);
  expect(startTypingSpy).toBeCalledTimes(1);
  expect(stopTypingSpy).toBeCalledTimes(1);
});

it("sends message on processMessage", async () => {
  const sendMessageSpy = jest.spyOn(SmoochLib, "sendMessage");
  const chatCoreZendesk = provideChatCoreZendesk(mockConfig);
  await chatCoreZendesk.init(mockMessageResponse());

  const msg = "hello world!";
  await chatCoreZendesk.processMessage({
    messages: [
      {
        source: "USER",
        text: msg,
      },
    ],
  });
  expect(sendMessageSpy).toBeCalledWith(msg, mockConversationId);
});

it("returns session on getSession", async () => {
  const chatCoreZendesk = provideChatCoreZendesk(mockConfig);
  await chatCoreZendesk.init(mockMessageResponse());
  expect(chatCoreZendesk.getSession()).toBe(mockConversationId);
});

it("triggers message event callbacks", async () => {
  const onCbSpy = jest.spyOn(SmoochLib, "on");
  const chatCoreZendesk = provideChatCoreZendesk(mockConfig);
  await chatCoreZendesk.init(mockMessageResponse());

  const text = "hello world!";
  const dummyFn = jest.fn();
  chatCoreZendesk.on("message", dummyFn);
  expect(onCbSpy).toBeCalled();

  // get "message:received" callback
  const onMessageFn = onCbSpy.mock.calls[0][1] as any;
  // simulate a message event
  onMessageFn(
    { text, type: "text", role: "business" },
    { conversation: { id: mockConversationId } }
  );
  expect(dummyFn).toBeCalledWith(text);
});

it("triggers close event callbacks", async () => {
  const onCbSpy = jest.spyOn(SmoochLib, "on");
  const chatCoreZendesk = provideChatCoreZendesk(mockConfig);
  await chatCoreZendesk.init(mockMessageResponse());

  const text = "hello world!";
  const conversation = { conversation: { id: mockConversationId } };
  const dummyFn = jest.fn();
  chatCoreZendesk.on("close", dummyFn);
  expect(onCbSpy).toBeCalled();

  // get "message:received" callback
  const onCloseFn = onCbSpy.mock.calls[0][1] as any;
  // simulate a message event from internal bot indicating agent has left
  onCloseFn(
    { text, type: "text", role: "business", subroles: ["AI"] },
    conversation
  );
  expect(dummyFn).toBeCalledWith(conversation);
});

it("triggers typing event callbacks", async () => {
  const onTypingSpy = jest.spyOn(SmoochLib, "on");
  const chatCoreZendesk = provideChatCoreZendesk(mockConfig);
  await chatCoreZendesk.init(mockMessageResponse());

  const dummyFn = jest.fn();
  chatCoreZendesk.on("typing", dummyFn);
  expect(onTypingSpy).toBeCalled();

  // get "typing:start" callback
  const onStartTypingFn = onTypingSpy.mock.calls[1][1] as any;
  // simulate a typing event
  onStartTypingFn();
  expect(dummyFn).toBeCalledWith(true);

  // get "typing:stop" callback
  const onStopTypingFn = onTypingSpy.mock.calls[2][1] as any;
  // simulate a typing event
  onStopTypingFn();
  expect(dummyFn).toBeCalledWith(false);
});

it("clear session on close event", async () => {
  const onCbSpy = jest.spyOn(SmoochLib, "on");
  const chatCoreZendesk = provideChatCoreZendesk(mockConfig);
  await chatCoreZendesk.init(mockMessageResponse());
  expect(chatCoreZendesk.getSession()).toBeDefined();

  // get the parameter passed to the onSpy callback
  const text = "hello world!";
  const conversation = { conversation: { id: mockConversationId } };
  const dummyFn = jest.fn();
  chatCoreZendesk.on("close", dummyFn);
  const onCbFn = onCbSpy.mock.calls[0][1] as any;

  // simulate a session close event via a message event from internal bot
  onCbFn(
    { text, type: "text", role: "business", subroles: ["AI"] },
    conversation
  );
  expect(dummyFn).toBeCalledWith(conversation);
  expect(chatCoreZendesk.getSession()).toBeUndefined();
});

it("clears session on resetSession", async () => {
  const chatCoreZendesk = provideChatCoreZendesk(mockConfig);
  await chatCoreZendesk.init(mockMessageResponse());
  expect(chatCoreZendesk.getSession()).toBeDefined();
  chatCoreZendesk.resetSession();
  expect(chatCoreZendesk.getSession()).toBeUndefined();
});

it("sets ticket fields on handoff", async () => {
  const createConversationSpy = jest.spyOn(SmoochLib, "createConversation");
  const chatCoreZendesk = provideChatCoreZendesk(mockConfig);
  await chatCoreZendesk.init(mockMessageResponse());
  expect(createConversationSpy).toBeCalledWith({
    metadata: {
      "zen:ticket_field:field1": "value1",
      "zen:ticket_field:field2": "value2",
      "zen:ticket:tags": "yext-chat-agent-handoff",
      YEXT_CHAT_SDK: true,
    },
  });
});

it("sets ticket tags defined in config on handoff", async () => {
  const createConversationSpy = jest.spyOn(SmoochLib, "createConversation");
  const chatCoreZendesk = provideChatCoreZendesk({
    ...mockConfig,
    ticketTags: ["tag1", "tag2"],
  });
  await chatCoreZendesk.init(mockMessageResponse());
  expect(createConversationSpy).toBeCalledWith({
    metadata: {
      "zen:ticket_field:field1": "value1",
      "zen:ticket_field:field2": "value2",
      "zen:ticket:tags": "yext-chat-agent-handoff, tag1, tag2",
      YEXT_CHAT_SDK: true,
    },
  });
});
