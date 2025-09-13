"use client";

import { createConversation } from "@/apis/requests/conversation/create";
import UserPromptTextarea from "@/app/chat/components/UserPromptTextarea";
import {
  useInitMessageStore,
  type AvaliableModelName,
} from "@/store/initMessage";
import { useNavigate } from "@tanstack/react-router";
import type { ChatStatus } from "ai";
import { useCallback, useRef, useState } from "react";
import AgentCard from "./components/AgentCard";
import { cn } from "@/lib/utils";
const cardList: {
  name: string;
  description: string;
  imgUrl: string;
  model: AvaliableModelName;
}[] = [
  {
    name: "德育班主任",
    description: "模仿一位经丰富的德育导师，帮助教师设计班级活动和班会安排。",
    imgUrl: "/chat/deyu-bzr.png",
    model: "deyu-bzr",
  },
  {
    name: "学科教师",
    description:
      "帮助学科教师在教案中自然融入社会情感教育，实现“教书”与“育人”的有机融合",
    imgUrl: "/chat/deyu-xkjs.png",
    model: "deyu-xkjs",
  },
  {
    name: "全员导师",
    description: "解决字生的社会情感问題，帮助导师设计干预方案和沟通话术。",
    imgUrl: "/chat/deyu-qyds.png",
    model: "deyu-qyds",
  },
  {
    name: "德育干部",
    description:
      "紧扣“校家社协同培乔学生社会情感能力”的核心目标，帮助教师设计德育活动方案。",
    imgUrl: "/chat/deyu-dygb.png",
    model: "deyu-dygb",
  },
  {
    name: "心芽",
    description:
      "构建一个能与学生自然对话、持续互动、情感引导的智能体，帮助他们在日常学习与生活中发展社会情感能力。",
    imgUrl: "/chat/deyu-xy.png",
    model: "deyu-xy",
  },
  {
    name: "家育良方",
    description:
      "面向家长的社会情感教育智鋤理，帮助家长识别、理解并改善孩子在成长过程中面临的社会情感问题。",
    imgUrl: "/chat/deyu-jylf.png",
    model: "deyu-jylf",
  },
];

export default function ChatPage() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<ChatStatus>("ready");
  const signal = useRef<AbortController | null>(null);
  const { setInitMessage, model, setModel } = useInitMessageStore();

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
                ? setModel("deyu-default")
                : setModel(card.model);
            }}
            key={card.name}
            {...card}
          />
        ))}
      </div>
    </div>
  );
}
