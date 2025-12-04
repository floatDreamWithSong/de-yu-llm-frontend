"use client";

import { createConversation } from "@/apis/requests/conversation/create";
import UserPromptTextarea from "@/app/chat/components/UserPromptTextarea";
import { useTitleAni } from "@/app/chat/hooks/use-title-ani";
import { useInitMessageStore } from "@/app/chat/stores/init-message";
import { EXTERNAL_LINKS } from "@/utils/constants/link";
import { useNavigate, useSearch } from "@tanstack/react-router";
import type { ChatStatus } from "ai";
import { useCallback, useRef, useState } from "react";
import MobileBanner from "../auth/components/MobileBanner";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import type { SubmitArgType } from "./types/submit";

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

  useTitleAni({ title: ".model-title" });

  const handleSubmit = async ({
    value: message,
    onSuccess,
    attachesUrl,
  }: SubmitArgType) => {
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
        setInitMessage(message, attachesUrl);
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
  const isMobile = useIsMobile();
  return (
    <div className="max-md:flex max-md:flex-col md:grid md:grid-rows-3 h-full px-4">
      <div
        className={cn([
          "absolute right-0 top-0 w-3/4 pointer-events-none",
          isMobile && "w-110",
        ])}
      >
        <img src="/chat-bg.png" alt="" />
      </div>
      {isMobile ? (
        <div className="flex-1">
          <Items className="justify-end gap-2 pr-0" />
          <MobileBanner />
        </div>
      ) : (
        <div className="max-md:flex-1 max-md:flex max-md:flex-col max-md:justify-center my-6 mb-8 row-span-1 mx-auto md:self-end space-y-6 text-center">
          <div className="flex items-center">
            <h1 className="model-title md:text-4xl font-bold text-primary whitespace-pre">
              启创·InnoSpark &nbsp; 做有温度的教育大模型
            </h1>
          </div>
        </div>
      )}
      <UserPromptTextarea
        className="row-span-1 mx-auto align-middle"
        onSubmit={handleSubmit}
        onAbort={abortRequest}
        status={status}
        {...search}
      />
      {!isMobile && <Items />}
    </div>
  );
}

const Items = ({ className, ...props }: React.ComponentProps<"div">) => {
  return (
    <div
      className={cn(
        "flex items-end justify-center p-2 gap-4 font-bold text-primary/90 [&>a]:hover:underline",
        className,
      )}
      {...props}
    >
      <a href={EXTERNAL_LINKS.PRIVACY_POLICY} target="_blank" rel="noreferrer">
        隐私政策
      </a>
      <a
        href={EXTERNAL_LINKS.SERVICE_PROTOCOL}
        target="_blank"
        rel="noreferrer"
      >
        服务协议
      </a>
      <a href={EXTERNAL_LINKS.CONTACT_US} target="_blank" rel="noreferrer">
        联系我们
      </a>
    </div>
  );
};
