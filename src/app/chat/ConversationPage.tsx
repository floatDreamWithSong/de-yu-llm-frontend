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
import { toast } from "sonner";
import { useInitMessageStore } from "@/store/initMessage";
import { useParams } from "@tanstack/react-router";
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
import { useDebounceEffect } from "ahooks";

export default function ConversationPage() {
  const { conversationId } = useParams({ strict: false });
  const { initMessage, hasProcessed, markAsProcessed, clearInitMessage } =
    useInitMessageStore();
  const [isReplace, setIsReplace] = useState(false);
  const inlinePromptTextareaRef = useRef<MessageEditorRef>(null);
  const previousMessageIdRef = useRef<string | null>(null);

  const {
    status,
    messages,
    sendMessage,
    lastAssistantMessageId,
    lastUserMessageId,
    abortRequest,
    handleFeedback,
    rollbackMessagesTo,
    fetchEarlier,
    hasMoreEarlier,
    isFetchingEarlier,
  } = useStreamCompletion(conversationId as string);

  useEffect(() => {
    if (initMessage && !hasProcessed) {
      markAsProcessed();
      console.log("发送消息", initMessage, hasProcessed);
      const message = initMessage;
      clearInitMessage();
      sendMessage(message);
      setTimeout(() => {
        console.log("post 发送消息", initMessage, hasProcessed);
      });
      // 发送消息后清除初始消息
    }
  }, [
    initMessage,
    hasProcessed,
    markAsProcessed,
    clearInitMessage,
    sendMessage,
  ]);
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
              useDeepThink: true,
              isReplace: isReplace,
            },
          },
          onSuccess,
        );
      }, 0);
    }
  };

  const handleCopy = (message: string) => {
    toast.success("复制成功");
    navigator.clipboard.writeText(message);
  };

  // 顶部哨兵：当最上方消息触达到视图顶端时，加载更早消息
  const topSentinelRef = useRef<HTMLDivElement | null>(null);
  useDebounceEffect(
    () => {
      const el = topSentinelRef.current;
      if (!el) return;
      const observer = new IntersectionObserver(
        (entries) => {
          const first = entries[0];
          console.log(first.isIntersecting, hasMoreEarlier);
          if (first.isIntersecting && hasMoreEarlier && !isFetchingEarlier) {
            document
              .querySelector("#list-container")
              ?.children[0]?.scrollTo(0, 32);
            fetchEarlier();
          }
        },
        { root: null, threshold: 0 },
      );
      observer.observe(el);
      return () => observer.disconnect();
    },
    [fetchEarlier, hasMoreEarlier, isFetchingEarlier],
    {
      wait: 800,
    },
  );
  useEffect(() => {
    const el = topSentinelRef.current;
    if (!el) return;
    if (messages.length) {
      const currentId = `mid-${messages[0].id}`;
      if (!previousMessageIdRef.current) {
        previousMessageIdRef.current = currentId;
      }
      console.log("现在最新的消息", currentId);
      const previousId = previousMessageIdRef.current;
      if (previousId === currentId) {
        return;
      }
      console.log("之前的消息", previousId);
      const previousNode = document.getElementById(previousId);
      console.log(previousNode);
      if (!previousNode) {
        return;
      }
      const scrooler = document.querySelector("#list-container")?.children[0];
      console.log("移动到", previousNode?.offsetTop);
      scrooler?.scrollTo(0, previousNode?.offsetTop);
      previousMessageIdRef.current = currentId;
    }
  }, [messages]);
  return (
    <div className="max-w-[1000px] mx-auto p-6 relative size-full rounded-lg">
      <div className="flex flex-col h-full">
        <Conversation id="list-container">
          <ConversationContent className="relative">
            {!initMessage && !hasProcessed ? (
              isFetchingEarlier ? (
                <div className="absolute w-full justify-center flex py-4">
                  <LoaderCircle className="animate-spin duration-500 stroke-primary" />
                </div>
              ) : (
                <div ref={topSentinelRef} className="w-full p-1" />
              )
            ) : null}
            {messages.map((message) => (
              <Message
                id={`mid-${message.id}`}
                key={message.id}
                from={message.role}
              >
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
                        src="/logo.svg"
                        className="order-1"
                        name="启创"
                      />
                    </div>
                    <div className="flex flex-col bg-white style__shallow-shadow rounded-3xl">
                      <MessageContent>
                        {message.think && (
                          <Reasoning
                            defaultOpen={!message.isCompleteThink}
                            className=""
                            isStreaming={status === "streaming"}
                          >
                            <ReasoningTrigger
                              isCompleted={message.isCompleteThink}
                            />
                            <ReasoningContent className="text-[#80808f]">
                              {message.think}
                            </ReasoningContent>
                          </Reasoning>
                        )}
                        {!!message.content && (
                          <Response>{message.content}</Response>
                        )}
                        {message.isStreaming &&
                          !message.think &&
                          !message.content && (
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
                              {message.feedback === 1 ? (
                                <Action
                                  onClick={handleFeedback.bind(null, {
                                    action: 0,
                                    messageId: message.id,
                                  })}
                                  label="Like"
                                >
                                  <ThumbsUpIcon className="size-4 fill-primary" />
                                </Action>
                              ) : message.feedback === 2 ? (
                                <Action
                                  onClick={handleFeedback.bind(null, {
                                    action: 0,
                                    messageId: message.id,
                                  })}
                                  label="DisLike"
                                >
                                  <ThumbsDownIcon className="size-4 fill-primary" />
                                </Action>
                              ) : (
                                <>
                                  <Action
                                    onClick={handleFeedback.bind(null, {
                                      action: 1,
                                      messageId: message.id,
                                    })}
                                    label="Like"
                                  >
                                    <ThumbsUpIcon className="size-4" />
                                  </Action>
                                  <Action
                                    onClick={handleFeedback.bind(null, {
                                      action: 2,
                                      messageId: message.id,
                                    })}
                                    label="Dislike"
                                  >
                                    <ThumbsDownIcon className="size-4" />
                                  </Action>
                                </>
                              )}
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
