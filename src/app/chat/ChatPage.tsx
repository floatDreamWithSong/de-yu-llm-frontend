"use client";

import { createConversation } from "@/apis/requests/conversation/create";
import UserPromptTextarea from "@/app/chat/components/UserPromptTextarea";
import { useInitMessageStore } from "@/store/initMessage";
import { useGSAP } from "@gsap/react";
import { useNavigate, useSearch } from "@tanstack/react-router";
import type { ChatStatus } from "ai";
import gsap from "gsap";
import SplitText from "gsap/SplitText";
import { useCallback, useRef, useState } from "react";
gsap.registerPlugin(SplitText);

export default function ChatPage() {
  const navigate = useNavigate({
    from: "/chat",
  });
  const search = useSearch({
    from: "/_authenticated/chat/",
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

  useGSAP(() => {
    const modelTitle = new SplitText(".model-title", {
      type: "chars",
    });
    gsap.from(modelTitle.chars, {
      duration: 0.8,
      opacity: 0,
      x: 40,
      ease: "power3.out",
      stagger: 0.01,
      delay: 0.2,
    });
    const modelSubtitle = new SplitText(".model-subtitle", {
      type: "chars",
    });
    gsap.from(modelSubtitle.chars, {
      duration: 0.3,
      opacity: 0,
      y: 10,
      ease: "power3.out",
      stagger: 0.01,
      delay: 0.6,
    });
  }, []);

  const handleSubmit = async (message: string, onSuccess?: () => void) => {
    if (message.trim() && status === "ready") {
      setStatus("submitted");
      try {
        signal.current = new AbortController();
        console.log("创建对话并发送消息:", message);
        const conversation = await createConversation(signal.current, {
          botId: search.botId,
        });
        console.log("对话创建成功:", conversation);

        // 将初始消息存储到状态库中
        setInitMessage(message);

        // 跳转到对话页面
        onSuccess?.();
        navigate({
          to: "/chat/$conversationId",
          search,
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
    <div className="grid grid-rows-3 h-full">
      <div className="absolute right-0 top-0 w-1/2">
        <img src="/chat-bg.png" alt="" />
      </div>
      <div className="my-6 row-span-1 mx-auto self-end space-y-6 text-center">
        <h1
          className="model-title text-4xl font-bold text-primary whitespace-pre"
          style={{
            letterSpacing: "0.1em",
          }}
        >
          启创·InnoSpark, 做有温度的教育大模型
        </h1>
        <h2 className="model-subtitle">
          我可以帮助你【设计实验】、【搜索文献】、【分析文档】、【分析数据】，你也可以直接开始和我对话
        </h2>
      </div>
      <UserPromptTextarea
        className="row-span-1 mx-auto align-middle"
        onSubmit={handleSubmit}
        onAbort={abortRequest}
        status={status}
        {...search}
      />
      <div />
    </div>
  );
}
