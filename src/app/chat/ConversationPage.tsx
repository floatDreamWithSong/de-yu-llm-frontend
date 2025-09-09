"use client";
import UserPromptTextarea, {} from "@/app/chat/components/UserPromptTextarea";
import { Actions } from "@/components/ai-elements/actions";
import { Action } from "@/components/ai-elements/actions";
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import {
  Message,
  MessageAvatar,
  MessageContent,
} from "@/components/ai-elements/message";
import {
  Reasoning,
  ReasoningContent,
  ReasoningTrigger,
} from "@/components/ai-elements/reasoning";
import { Response } from "@/components/ai-elements/response";
import { useStreamCompletion } from "@/hooks/use-stream-completion";
import messageToaster from "@/lib/message";
import { useParams, useSearch } from "@tanstack/react-router";
import gsap from "gsap";
import { SplitText } from "gsap/all";
import {
  Copy,
  LoaderCircle,
  PencilLine,
  RefreshCcw,
  ThumbsDownIcon,
  ThumbsUpIcon,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import MessageEditor, {
  type MessageEditorRef,
} from "./components/MessageEditor";
gsap.registerPlugin(SplitText);

export default function ConversationPage() {
  const { conversationId } = useParams({ strict: false });
  const search = useSearch({ strict: false }) as { initialMessage?: string };
  const hasProcessedInitialMessage = useRef(false);
  const [isReplace, setIsReplace] = useState(false);
  const inlinePromptTextareaRef = useRef<MessageEditorRef>(null);

  const {
    status,
    messages,
    sendMessage,
    lastAssistantMessageId,
    lastUserMessageId,
    abortRequest,
    rollbackMessagesTo,
  } = useStreamCompletion(conversationId as string);

  useEffect(() => {
    if (search.initialMessage && !hasProcessedInitialMessage.current) {
      hasProcessedInitialMessage.current = true;
      sendMessage(search.initialMessage);
    }
  }, [search.initialMessage, sendMessage]);

  const handleRegenerate = () => {
    const messageId = messages.find(
      (message) => message.id === lastUserMessageId.current,
    );
    if (!messageId) return;
    const message = messageId.content;
    if (message && status === "ready") {
      rollbackMessagesTo(messageId.id);
      setTimeout(() => {
        sendMessage(message, {
          completionsOption: { isRegen: true },
          replyId: messageId.id,
        });
      }, 0);
    }
  };

  const handleEditUserMessage = (message: string) => {
    // 将消息绑定到输入框中
    console.log("handleEditUserMessage", message);
    setIsReplace(true);
    // 使用 setTimeout 确保组件已经渲染
    setTimeout(() => {
      inlinePromptTextareaRef.current?.setTextContent(message);
      inlinePromptTextareaRef.current?.focus();
    }, 0);
  };

  const cancelEditUserMessage = () => {
    inlinePromptTextareaRef.current?.blur();
    setIsReplace(false);
  };

  const handleSubmit = (message: string, onSuccess?: () => void) => {
    if (message.trim() && status === "ready") {
      if (isReplace) {
        inlinePromptTextareaRef.current?.blur();
        if (lastUserMessageId.current) {
          rollbackMessagesTo(lastUserMessageId.current);
        }
        setIsReplace(false);
      }
      setTimeout(() => {
        sendMessage(
          message,
          {
            completionsOption: {
              isReplace: isReplace,
            },
          },
          onSuccess,
        );
      }, 0);
    }
  };

  const handleCopy = (message: string) => {
    messageToaster.success("复制成功");
    navigator.clipboard.writeText(message);
  };

  return (
    <div className="max-w-[1000px] mx-auto p-6 relative size-full rounded-lg">
      <div className="flex flex-col h-full">
        <Conversation>
          <ConversationContent>
            {messages.map((message) => (
              <Message key={message.id} from={message.role}>
                {message.role === "user" ? (
                  message.id !== lastUserMessageId.current || !isReplace ? (
                    <div className="flex flex-col items-end">
                      <MessageContent>
                        <p>{message.content}</p>
                      </MessageContent>
                      {status === "ready" &&
                        lastUserMessageId.current === message.id && (
                          <Actions className="mt-2">
                            <Action
                              label="Copy"
                              onClick={() => handleCopy(message.content)}
                            >
                              <Copy className="size-4" />
                            </Action>
                            <Action
                              label="Regenerate"
                              onClick={() =>
                                handleEditUserMessage(message.content)
                              }
                            >
                              <PencilLine className="size-4" />
                            </Action>
                          </Actions>
                        )}
                    </div>
                  ) : (
                    <MessageEditor
                      ref={inlinePromptTextareaRef}
                      onSubmit={handleSubmit}
                      onExit={cancelEditUserMessage}
                      disabled={status !== "ready"}
                    />
                  )
                ) : (
                  <div className="flex gap-3">
                    <div>
                      <MessageAvatar
                        src="/logo.png"
                        className="order-1"
                        name="德育班主任"
                      />
                    </div>
                    <div className="flex flex-col bg-white style__shallow-shadow rounded-3xl">
                      <MessageContent>
                        {message.think && (
                          <Reasoning
                            className=""
                            isStreaming={status === "streaming"}
                          >
                            <ReasoningTrigger />
                            <ReasoningContent className="text-[#80808f]">
                              {message.think}
                            </ReasoningContent>
                          </Reasoning>
                        )}
                        {!!message.content && (
                          <Response>{message.content}</Response>
                        )}
                        {message.isStreaming && (!message.think && !message.content) && (
                          <LoaderCircle className="size-4 animate-spin" />
                        )}
                        {!message.isStreaming &&
                          lastAssistantMessageId.current === message.id && (
                            <Actions className="mt-2">
                              <Action
                                label="Copy"
                                onClick={() => handleCopy(message.content)}
                              >
                                <Copy className="size-4" />
                              </Action>
                              <Action
                                label="Regenerate"
                                onClick={handleRegenerate}
                              >
                                <RefreshCcw className="size-4" />
                              </Action>
                              <Action label="Like">
                                <ThumbsUpIcon className="size-4" />
                              </Action>
                              <Action label="Dislike">
                                <ThumbsDownIcon className="size-4" />
                              </Action>
                            </Actions>
                          )}
                      </MessageContent>
                    </div>
                  </div>
                )}
              </Message>
            ))}
          </ConversationContent>
          <ConversationScrollButton />
        </Conversation>
        <UserPromptTextarea
          className="mx-auto sticky bottom-4"
          onSubmit={handleSubmit}
          onAbort={abortRequest}
          status={status}
        />
      </div>
    </div>
  );
}
