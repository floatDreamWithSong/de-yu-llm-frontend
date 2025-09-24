"use client";

import { createConversation } from "@/apis/requests/conversation/create";
import UserPromptTextarea from "@/app/chat/components/UserPromptTextarea";
import { useInitMessageStore } from "@/store/initMessage";
import { useNavigate } from "@tanstack/react-router";
import type { ChatStatus } from "ai";
import { useCallback, useEffect, useRef, useState } from "react";
import AgentCard from "./components/AgentCard";
import { cn } from "@/lib/utils";
import { cardList } from "./constants";

export default function ChatPage() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<ChatStatus>("ready");
  const signal = useRef<AbortController | null>(null);
  const { setInitMessage, model, setModel } = useInitMessageStore();
  useEffect(() => {
    setModel("deyu-default", "");
  }, [setModel]);
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
        const conversation = await createConversation(signal.current);
        console.log("对话创建成功:", conversation);

        // 将初始消息存储到状态库中
        setInitMessage(message);

        // 跳转到对话页面
        onSuccess?.();
        navigate({
          to: "/chat/$conversationId",
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

  return (
    <div className="mx-8 grid grid-rows-9 py-20 h-full">
      <div className="row-span-1 self-center space-y-6 text-center">
        <h1
          className="model-title -translate-y-2 text-4xl font-bold text-primary whitespace-pre"
          style={{
            letterSpacing: "0.1em",
          }}
        >
          <img
            src="/chat/fake-title.png"
            alt="张江高科 · 高科芯 德育大模型"
            className="max-h-16 select-none"
          />
        </h1>
      </div>
      <UserPromptTextarea
        className="row-span-4 max-w-full align-middle h-full cursor-text"
        onSubmit={handleSubmit}
        onAbort={abortRequest}
        status={status}
      />
      <div className="row-span-4 grid grid-rows-2 grid-cols-3 gap-6 mt-6">
        {cardList.map((card) => (
          <AgentCard
            className={cn([
              "transition-all",
              model === card.model
                ? "scale-105"
                : model !== "deyu-default"
                  ? "brightness-75"
                  : "",
            ])}
            onClick={() => {
              model === card.model
                ? setModel("deyu-default", "")
                : setModel(card.model, card.name);
            }}
            key={card.name}
            {...card}
          />
        ))}
      </div>
    </div>
  );
}
