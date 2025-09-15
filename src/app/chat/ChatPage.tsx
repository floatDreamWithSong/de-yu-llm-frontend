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
    name: "润心桥",
    description: "读懂班级里的每一个独特，让关怀如期而至。——您专注播种，我默默耕耘。班主任的专属智慧伙伴，贴心翻译成长的密语，让心与心的对话自然发生。",
    imgUrl: "/chat/agent-1.png",
    model: "deyu-bzr",
  },
  {
    name: "慧育港",
    description:
      "为德育工作者点亮前行的灯塔。这里有智能方案、资源推荐，让每一次德育活动都散发星光——让我们一起把教育做得更有温度。",
    imgUrl: "/chat/agent-2.png",
    model: "deyu-xkjs",
  },
  {
    name: "引航号",
    description: "陪伴导师走进学生的成长旅程。提供个性化成长档案和沟通建议，让每位导师都能成为学生愿意信赖的引路人——因为最好的教育，源于真诚的陪伴。",
    imgUrl: "/chat/agent-3.png",
    model: "deyu-qyds",
  },
  {
    name: "育智云",
    description:
      "助力教师打造知识与温暖交融的课堂。基于学情智能设计教学，让备课更轻松，课堂更生动——因为教育不仅是传授知识，更是点亮心灵。",
    imgUrl: "/chat/agent-4.png",
    model: "deyu-dygb",
  },
  {
    name: "解忧铺",
    description:
      "24小时在线的成长树洞。你的心事，永远有地方倾诉；你的烦恼，总会得到温柔回应——愿孩子们在这里找回前行的勇气和微光。",
    imgUrl: "/chat/agent-5.png",
    model: "deyu-xy",
  },
  {
    name: "暖心阁",
    description:
      "做家长的教育知心人。解读孩子成长密码，提供亲子沟通建议，让家庭教育不再迷茫——让我们陪着你，一起静待花开。",
    imgUrl: "/chat/agent-6.png",
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
