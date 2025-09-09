"use client";
import UserPromptTextarea from "@/app/chat/components/UserPromptTextarea";
import { Actions } from "@/components/ai-elements/actions";
import { Action } from "@/components/ai-elements/actions";
import {
  Message,
  MessageAvatar,
  MessageContent,
} from "@/components/ai-elements/message";
import { Response } from "@/components/ai-elements/response";
import { useStreamCompletion } from "@/hooks/use-stream-completion";
import { useGSAP } from "@gsap/react";
import { useParams, useSearch } from "@tanstack/react-router";
import gsap from "gsap";
import { SplitText } from "gsap/all";
import {
  Copy,
  PencilLine,
  RefreshCcw,
  ThumbsDownIcon,
  ThumbsUpIcon,
} from "lucide-react";
import { useLayoutEffect, useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
gsap.registerPlugin(SplitText);


export default function ConversationPage() {
  const { conversationId } = useParams({ strict: false });
  const search = useSearch({ strict: false }) as { initialMessage?: string };
  const [title, setTitle] = useState("");
  const hasProcessedInitialMessage = useRef(false);
  
  const { 
    isStreaming, 
    messages, 
    sendMessage, 
  } = useStreamCompletion(conversationId as string);

  useLayoutEffect(() => {
    setTitle(conversationId as string);
  }, [conversationId]);

  useEffect(() => {
    if(search.initialMessage && !hasProcessedInitialMessage.current) {
      hasProcessedInitialMessage.current = true;
      sendMessage(search.initialMessage);
    }
  }, [search.initialMessage, sendMessage]);

  useGSAP(() => {
    if(!title) return;
    const modelTitle = new SplitText("#sidebar-header h1", {
      type: "chars",
    });
    gsap.from(modelTitle.chars, {
      duration: 1,
      opacity: 0,
      y: 10,
      stagger: 0.02,
      ease: "elastic.out(1,0.6)",
      delay: 0.2,
    });
  }, [title]);

  const handleSubmit = (message: string) => {
    if (message.trim() && !isStreaming) {
      sendMessage(message);
    }
  };

  return (
    <>
      <div className="overflow-auto h-full" >
        {!!title &&
          createPortal(
            <h1>Conversation {conversationId}</h1>,
            document.getElementById("sidebar-header") || document.body,
          )}
        <div className="max-w-[1000px] mx-auto">
          {messages.map((message) => (
            <Message key={message.id} from={message.role}>
              {message.role === 'user' ? (
                <div className="flex flex-col items-end">
                  <MessageContent>
                    <p>{message.content}</p>
                  </MessageContent>
                  <Actions className="mt-2">
                    <Action label="Copy">
                      <Copy className="size-4" />
                    </Action>
                    <Action label="Regenerate">
                      <PencilLine className="size-4" />
                    </Action>
                  </Actions>
                </div>
              ) : (
                <div className="flex items-start">
                  <MessageAvatar
                    src="/logo.png"
                    className="order-1"
                    name="德育班主任"
                  />
                  <div className="flex flex-col">
                    <MessageContent>
                      {message.think ?? ''}
                      <Response>
                        {message.content || (message.isStreaming ? '正在思考...' : '')}
                      </Response>
                      {!message.isStreaming && message.content && (
                        <Actions className="mt-2">
                          <Action label="Copy">
                            <Copy className="size-4" />
                          </Action>
                          <Action label="Regenerate">
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
        </div>
      </div>
      <UserPromptTextarea 
        className="mx-auto sticky bottom-4" 
        onSubmit={handleSubmit}
        disabled={isStreaming}
      />
    </>
  );
}
