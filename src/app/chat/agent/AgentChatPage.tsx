"use client";

import { createConversation } from "@/apis/requests/conversation/create";
import UserPromptTextarea from "@/app/chat/components/UserPromptTextarea";
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
import { Suggestion, Suggestions } from "@/components/ai-elements/suggestion";
import { ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { useBotInfo } from "@/hooks/agent/use-bot";
import { cn } from "@/lib/utils";
import { useInitMessageStore } from "@/store/initMessage";
import { useGSAP } from "@gsap/react";
import { useNavigate, useParams, useSearch } from "@tanstack/react-router";
import type { ChatStatus } from "ai";
import { useCallback, useRef, useState } from "react";
import gsap from "gsap";
import SplitText from "gsap/SplitText";
gsap.registerPlugin(SplitText);

export default function AgentChatPage() {
  const navigate = useNavigate({
    from: "/chat/agent/chat/$agentId",
  });
  const search = useSearch({
    from: "/_authenticated/chat/agent/chat/$agentId",
  });
  const { agentId } = useParams({
    from: "/_authenticated/chat/agent/chat/$agentId",
  });
  const [status, setStatus] = useState<ChatStatus>("ready");
  const signal = useRef<AbortController | null>(null);
  const setInitMessage = useInitMessageStore((s) => s.setInitMessage);
  const abortRequest = useCallback(() => {
    if (signal.current) {
      setStatus("ready");
      signal.current.abort();
      signal.current = null;
    }
  }, []);

  const handleSubmit = async (message: string, onSuccess?: () => void) => {
    if (message.trim() && status === "ready") {
      setStatus("submitted");
      try {
        signal.current = new AbortController();
        console.log("创建对话并发送消息:", message);
        const conversation = await createConversation(signal.current,{
          botId: agentId
        });
        console.log("对话创建成功:", conversation);

        // 将初始消息存储到状态库中
        setInitMessage(message);

        // 跳转到对话页面
        onSuccess?.();
        navigate({
          to: "/chat/$conversationId",
          search: {
            ...search,
            botId: agentId,
          },
          params: { conversationId: conversation.conversationId },
        });
      } catch (error) {
        console.error("创建对话失败:", error);
      } finally {
        setStatus("ready");
        signal.current = null;
      }
    }
  };
  const botInfo = useBotInfo({ botId: agentId });
  useGSAP(() => {
    if (botInfo.isSuccess && !botInfo.isFetching) {
      const modelTitle = new SplitText("#agent-prologue", {
        type: "chars",
      });
      const timeline = gsap.timeline();
      timeline.from(modelTitle.chars, {
        duration: 0.6,
        opacity: 0,
        x: 20,
        ease: "power2.out",
        stagger: 0.01,
      });

      const suggestionsRef = document.querySelectorAll(".agent-suggestion");
      if (suggestionsRef.length > 0) {
        const suggestions = suggestionsRef;
        timeline.from(suggestions, {
          opacity: 0,
          y: 10,
          x: 10,
          scale: 0.9,
          duration: 0.5,
          stagger: 0.1,
          ease: "power3.out",
        });
      }
    }
  }, [botInfo.isSuccess, botInfo.isFetching]);
  return (
    <ResizablePanelGroup
      direction="horizontal"
      className={cn([
        "rounded-lg border md:min-w-[450px]",
        "size-full flex overflow-x-hidden relative",
      ])}
    >
      <ResizablePanel
        className={cn([" mx-auto py-6 size-full duration-300 transition-all"])}
      >
        <div className="max-w-[1000px] mx-auto px-4 flex flex-col h-full transition-none">
          <Conversation id="list-container" className="style__scroller-none">
            {botInfo.isSuccess && !botInfo.isFetching && (
              <ConversationContent className="relative">
                <Message from={"assistant"}>
                  <div className="flex gap-3">
                    <div>
                      <MessageAvatar
                        src={botInfo.data.iconUrl}
                        className="order-1"
                        name="启创"
                      />
                    </div>
                    <div>
                      <MessageContent className="group-[.is-assistant]:bg-white m-2 style__shallow-shadow rounded-3xl">
                        <div id="agent-prologue">
                          {botInfo.data?.onboardingInfo.prologue}
                        </div>
                      </MessageContent>
                      <Suggestions className="p-2 flex flex-col items-start">
                        {botInfo.data.onboardingInfo.suggestedQuestions.map(
                          (question) => (
                            <Suggestion
                              className="agent-suggestion transition-colors"
                              key={question}
                              onClick={() => handleSubmit(question)}
                              suggestion={question}
                            />
                          ),
                        )}
                      </Suggestions>
                    </div>
                  </div>
                </Message>
              </ConversationContent>
            )}
            <ConversationScrollButton />
          </Conversation>
          <UserPromptTextarea
            className="mx-auto sticky bottom-4"
            onSubmit={handleSubmit}
            onAbort={abortRequest}
            status={status}
            botId={agentId}
            think={search.think}
            webSearch={search.webSearch}
          />
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
