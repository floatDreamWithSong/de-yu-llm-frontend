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
import {
  Branch,
  BranchMessages,
  BranchPrevious,
  BranchPage,
  BranchNext,
  BranchSelector,
} from "@/components/ai-elements/branch";
import type { SseSearchCite } from "@/apis/requests/conversation/schema";
import { cn } from "@/lib/utils";
import CiteBar from "./components/CiteBar";
import MessageCiteButton from "./components/MessageCiteButton";
import CodeEditorBar from "./components/CodeEditorBar";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";

export default function ConversationPage() {
  const { conversationId } = useParams({ strict: false });
  const { initMessage, hasProcessed, markAsProcessed, clearInitMessage } =
    useInitMessageStore();
  const [isReplace, setIsReplace] = useState(false);
  const inlinePromptTextareaRef = useRef<MessageEditorRef>(null);
  const previousMessageIdRef = useRef<string | null>(null);
  const [uiCites, setUiCites] = useState<SseSearchCite[]>([]);
  const {
    status,
    messages,
    sendMessage,
    lastAssistantMessageId,
    lastUserMessageId,
    abortRequest,
    handleFeedback,
    rollbackMessagesTo,
    selectBranchIdRef,
    fetchEarlier,
    lastAssistantMessageBranch,
    hasMoreEarlier,
    isFetchingEarlier,
    isOpenCite,
    setIsOpenCite,
    isOpenCodeEditor,
    setIsOpenCodeEditor,
  } = useStreamCompletion(conversationId as string);
  const getTargetMes = (id: string) => {
    if (!id) {
      return;
    }
    const res = messages.find((mes) => mes.id === id);
    if (!res) {
      return lastAssistantMessageBranch.find((mes) => mes.id === id);
    }
    return res;
  };
  const codeMes = getTargetMes(isOpenCodeEditor);

  useEffect(() => {
    if (initMessage && !hasProcessed) {
      markAsProcessed();
      const message = initMessage;
      clearInitMessage();
      sendMessage(message);
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
    const lastUserMessage = messages.find(
      (message) => message.id === lastUserMessageId.current,
    );
    if (!lastUserMessage) return;
    const message = lastUserMessage.content;
    if (message && status === "ready") {
      rollbackMessagesTo(
        lastUserMessage.id,
        lastAssistantMessageBranch.length === 0,
      );
      setTimeout(() => {
        sendMessage(message, {
          completionsOption: { isRegen: true },
          replyId: lastUserMessage.id,
        });
      }, 0);
    }
  };

  const handleEditUserMessage = (message: string) => {
    // 将消息绑定到输入框中
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
              isReplace,
              selectedRegenId: lastAssistantMessageBranch.length
                ? (selectBranchIdRef.current ??
                  lastAssistantMessageBranch[
                    lastAssistantMessageBranch.length - 1
                  ].id)
                : undefined,
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
      const previousId = previousMessageIdRef.current;
      if (previousId === currentId) {
        return;
      }
      const previousNode = document.getElementById(previousId);
      if (!previousNode) {
        return;
      }
      const scrooler = document.querySelector("#list-container")?.children[0];
      scrooler?.scrollTo(0, previousNode?.offsetTop);
      previousMessageIdRef.current = currentId;
    }
  }, [messages]);

  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  const sideBarRef = useRef<any>(null);
  useEffect(()=>{
    if(isOpenCodeEditor) {
      sideBarRef.current.resize(50);
    } else if(isOpenCite) {
      sideBarRef.current.resize(20);
    } else {
      sideBarRef.current.resize(0);
    }
  },[isOpenCite, isOpenCodeEditor])
  return (
    <ResizablePanelGroup
      direction="horizontal"
      className={cn([
        "rounded-lg border md:min-w-[450px]",
        "size-full flex overflow-x-hidden relative",
      ])}
    >
      <ResizablePanel
        className={cn([
          " mx-auto py-6 size-full duration-300 transition-all",
          // !!isOpenCite && "lg:pr-80",
          // isOpenCodeEditor && "lg:pr-240",
        ])}
      >
        <div className="max-w-[1000px] mx-auto px-4 flex flex-col h-full transition-none">
          <Conversation id="list-container" className="style__scoller-none">
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
                      <div>
                        <Branch
                          className="flex flex-col bg-transparent"
                          onBranchChange={(index) => {
                            selectBranchIdRef.current =
                              lastAssistantMessageBranch[index].id;
                          }}
                        >
                          <BranchMessages>
                            {(message.id === lastAssistantMessageId.current
                              ? lastAssistantMessageBranch.length
                                ? message.isStreaming
                                  ? [message]
                                  : lastAssistantMessageBranch
                                : [message]
                              : [message]
                            ).map((_message, _, messageArray) => {
                              const forRegenList = messageArray.length > 1;
                              const regenerateable =
                                _message.id ===
                                  lastAssistantMessageId.current ||
                                messageArray.length > 1;
                              return (
                                <div key={_message.id}>
                                  <MessageCiteButton
                                    message={_message}
                                    onClick={() => {
                                      setUiCites(_message.searchRes ?? []);
                                      if (isOpenCite !== _message.id)
                                        setIsOpenCite(_message.id);
                                      else {
                                        setIsOpenCite("");
                                      }
                                    }}
                                  />
                                  <MessageContent className="group-[.is-assistant]:bg-white m-2 style__shallow-shadow rounded-3xl">
                                    <div>
                                      {_message.think && (
                                        <Reasoning
                                          defaultOpen={
                                            !_message.isCompleteThink
                                          }
                                          className=""
                                          isStreaming={status === "streaming"}
                                        >
                                          <ReasoningTrigger
                                            isCompleted={
                                              _message.isCompleteThink
                                            }
                                          />
                                          <ReasoningContent className="text-[#80808f]">
                                            {_message.think}
                                          </ReasoningContent>
                                        </Reasoning>
                                      )}
                                      {!!_message.content && (
                                        <Response
                                          onToggleCodeEditor={() => {
                                            if (isOpenCite !== _message.id) {
                                              setIsOpenCodeEditor(_message.id);
                                            } else {
                                              setIsOpenCodeEditor("");
                                            }
                                          }}
                                          cites={_message.searchRes}
                                        >
                                          {_message.content}
                                        </Response>
                                      )}
                                      {_message.isStreaming &&
                                        !_message.think &&
                                        !_message.content && (
                                          <LoaderCircle className="size-4 animate-spin" />
                                        )}
                                    </div>

                                    {!message.isStreaming && (
                                      <Actions className="mt-2">
                                        <Action
                                          label="Copy"
                                          onClick={() =>
                                            handleCopy(_message.content)
                                          }
                                        >
                                          <Copy className="size-4" />
                                        </Action>
                                        {regenerateable && (
                                          <Action
                                            label="Regenerate"
                                            onClick={handleRegenerate}
                                          >
                                            <RefreshCcw className="size-4" />
                                          </Action>
                                        )}
                                        {_message.feedback === 1 ? (
                                          <Action
                                            onClick={handleFeedback.bind(null, {
                                              action: 0,
                                              messageId: _message.id,
                                              forRegenList,
                                            })}
                                            label="Like"
                                          >
                                            <ThumbsUpIcon className="size-4 fill-primary" />
                                          </Action>
                                        ) : _message.feedback === 2 ? (
                                          <Action
                                            onClick={handleFeedback.bind(null, {
                                              action: 0,
                                              messageId: _message.id,
                                              forRegenList,
                                            })}
                                            label="DisLike"
                                          >
                                            <ThumbsDownIcon className="size-4 fill-primary" />
                                          </Action>
                                        ) : (
                                          <>
                                            <Action
                                              onClick={handleFeedback.bind(
                                                null,
                                                {
                                                  action: 1,
                                                  messageId: _message.id,
                                                  forRegenList,
                                                },
                                              )}
                                              label="Like"
                                            >
                                              <ThumbsUpIcon className="size-4" />
                                            </Action>
                                            <Action
                                              onClick={handleFeedback.bind(
                                                null,
                                                {
                                                  action: 2,
                                                  messageId: _message.id,
                                                  forRegenList,
                                                },
                                              )}
                                              label="Dislike"
                                            >
                                              <ThumbsDownIcon className="size-4" />
                                            </Action>
                                          </>
                                        )}
                                        {messageArray.length > 1 && (
                                          <BranchSelector from="assistant">
                                            <BranchPrevious />
                                            <BranchPage />
                                            <BranchNext />
                                          </BranchSelector>
                                        )}
                                      </Actions>
                                    )}
                                  </MessageContent>
                                </div>
                              );
                            })}
                          </BranchMessages>
                        </Branch>
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
      </ResizablePanel>
      <ResizableHandle />
      <ResizablePanel defaultSize={0} maxSize={60} ref={sideBarRef}>
        {isOpenCite && (
          <CiteBar
            onClose={() => setIsOpenCite("")}
            className={cn([
              "bg-chat h-full style__scoller-none p-4 flex flex-col border-l-2 border-primary/10 duration-300 transition-transform right-0",
              // !isOpenCite && "translate-x-full",
            ])}
            uiCites={uiCites}
          />
        )}

        {isOpenCodeEditor && (
          <CodeEditorBar
            code={codeMes?.code}
            codeType={codeMes?.codeType}
            onClose={() => setIsOpenCodeEditor("")}
            className={cn([
              "bg-chat h-full w-full style__scoller-none p-4 flex flex-col border-l-2 border-primary/10 duration-300 transition-transform right-0",
              // !isOpenCodeEditor && "translate-x-full",
            ])}
          />
        )}
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
