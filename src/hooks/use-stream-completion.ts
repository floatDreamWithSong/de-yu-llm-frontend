import type { Request as CompletionRequest } from "@/apis/requests/conversation/completion";
import { getConversationDetail } from "@/apis/requests/conversation/detail";
import { env } from "@/env";
import { GlobalHeader, tokenStore } from "@/lib/request";
import { useChatStore } from "@/store/chat";
import type { ChatStatus, DeepPartial } from "ai";
import { useState, useCallback, useRef, useEffect } from "react";

export interface StreamChunk {
  id: number;
  event: "meta" | "model" | "chat" | "end";
  data: Record<string, unknown>;
}
// 后端 SSE 单帧 payload
export interface SSEDataPayload {
  message: {
    content: string; // 实际是 JSON 字符串，如 "{\"text\":\"这里\"}"
    contentType: number;
  };
  conversationId: string;
  sectionId: string;
  replyId: string;
  isDeleted: boolean;
  status: number;
  inputContentType: number;
  messageIndex: number;
  botId: string;
}

// 如果 content 里是 {text: string}，可再定义一个解析后的结构
export interface TextContent {
  text?: string;
  think?: string;
}
export interface ChatMessage {
  id: string;
  think?: string;
  content: string;
  role: "user" | "assistant";
  timestamp: Date;
  isStreaming?: boolean;
  isCompleteThink?: boolean;
}

export function useStreamCompletion(conversationId: string) {
  const status = useRef<ChatStatus>("ready");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const abortControllerRef = useRef<AbortController | null>(null);
  const lastUserMessageId = useRef<string | null>(null);
  const lastAssistantMessageId = useRef<string | null>(null);

  // 使用 Zustand store 获取完成配置
  const completionConfig = useChatStore((state) => state.completionConfig);

  useEffect(() => {
    getConversationDetail({
      conversationId,
      page: {
        page: 1,
        size: 10,
      },
    }).then((data) => {
      setMessages(
        data.messageList
          .filter((message) => !!message.content)
          .map((message) => ({
            id: message.messageId,
            content: message.content,
            think: message.ext.think,
            role: message.userType,
            timestamp: new Date(message.createTime),
            isCompleteThink: message.ext.think !== "" && message.content !== "",
          })),
      );
    });
  }, [conversationId]);
  const addMessage = useCallback(
    (content: string, role: "user" | "assistant", isStreaming = false) => {
      const newMessage: ChatMessage = {
        id: Math.random().toString(36).substr(2, 9),
        content,
        role,
        timestamp: new Date(),
        isStreaming,
      };
      setMessages((prev) => [...prev, newMessage]);
      if (role === "user") {
        lastUserMessageId.current = newMessage.id;
      } else {
        lastAssistantMessageId.current = newMessage.id;
      }
      return newMessage.id;
    },
    [],
  );
  const rollbackMessagesTo = useCallback(
    (id: string) => {
      const index = messages.findIndex((msg) => msg.id === id);
      if (index !== -1) {
        setMessages((prev) => prev.slice(0, index));
      }
    },
    [messages],
  );
  const modifyMessage = useCallback(
    (id: string, message: Partial<ChatMessage>) => {
      setMessages((prev) =>
        prev.map((msg) => (msg.id === id ? { ...msg, ...message } : msg)),
      );
    },
    [],
  );

  const accumulativeMessage = useCallback((id: string, opt: TextContent) => {
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === id
          ? {
              ...msg,
              content: (msg.content ?? "") + (opt.text ?? ""),
              think: (msg.think ?? "") + (opt.think ?? ""),
            }
          : msg,
      ),
    );
  }, []);

  const abortRequest = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      status.current = "ready";
    }
  }, []);

  const sendMessage = useCallback(
    async (
      content: string,
      options?: DeepPartial<Omit<CompletionRequest, "messages">>,
      onSuccess?: () => void,
    ) => {
      if (status.current !== "ready" || !conversationId) return;

      // 取消之前的请求
      if (abortControllerRef.current) {
        console.log("取消之前的请求");
        abortControllerRef.current.abort();
      }

      // 创建新的AbortController
      const newAbortController = new AbortController();
      abortControllerRef.current = newAbortController;

      status.current = "submitted";
      let aiMessageId = "";

      try {
        // 添加用户消息
        addMessage(content, "user");

        const requestData: CompletionRequest = {
          model: completionConfig.model,
          botId: completionConfig.botId,
          conversationId,
          ...options,
          completionsOption: {
            ...completionConfig.completionsOption,
            ...options?.completionsOption,
          },
          messages: [
            {
              content,
              contentType: 0,
              attaches: [],
              references: [],
              role: "user",
            },
          ],
        };

        const token = tokenStore.get();
        const response = await fetch(
          `${env.VITE_API_BASE_URL}/v1/completions`,
          {
            method: "POST",
            headers: {
              Authorization: token || "",
              ...GlobalHeader.get(),
            },
            body: JSON.stringify(requestData),
            signal: newAbortController.signal,
          },
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const reader = response.body?.getReader();
        if (!reader) {
          throw new Error("无法读取响应流");
        }

        const decoder = new TextDecoder();
        let buffer = "";
        let currentId = 0;
        let currentType: StreamChunk["event"] = "meta";
        status.current = "streaming";
        onSuccess?.();
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            if (line.startsWith("id: ")) {
              currentId = Number.parseInt(line.substring(4), 10);
              continue;
            }
            if (line.startsWith("event: ")) {
              currentType = line.substring(7) as StreamChunk["event"];
              continue;
            }
            if (line.startsWith("data: ")) {
              const dataStr = line.substring(6);
              if (dataStr.trim() === "{}") continue;

              try {
                const data = JSON.parse(dataStr) as SSEDataPayload;
                if (!aiMessageId) {
                  aiMessageId = addMessage(data.replyId, "assistant", true);
                }
                console.log("收到流式数据:", {
                  id: currentId,
                  event: currentType,
                  data,
                });
                if (currentType === "chat" && data.message) {
                  const content = JSON.parse(
                    data.message.content,
                  ) as TextContent;
                  console.log("content", content);
                  if (content.text) {
                    console.log(
                      "accumulativeMessage",
                      aiMessageId,
                      content.text,
                    );
                    accumulativeMessage(aiMessageId, { text: content.text });
                  }
                  if (content.think) {
                    console.log(
                      "accumulativeMessage",
                      aiMessageId,
                      content.think,
                    );
                    accumulativeMessage(aiMessageId, { think: content.think });
                  }
                }
              } catch (e) {
                console.error("解析数据失败:", e, dataStr);
              }
            }
          }
        }
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") {
          console.log("请求被取消");
          return;
        }
        console.error("发送消息失败:", error);
        // 更新AI消息为错误状态
        modifyMessage(aiMessageId, {
          content: "抱歉，发生了错误，请重试。",
          isStreaming: false,
        });
      } finally {
        status.current = "ready";
        abortControllerRef.current = null;
        // 完成流式输出
        modifyMessage(aiMessageId, { isStreaming: false });
      }
    },
    [
      conversationId,
      addMessage,
      modifyMessage,
      accumulativeMessage,
      completionConfig,
    ],
  );

  return {
    status: status.current,
    messages,
    rollbackMessagesTo,
    lastAssistantMessageId,
    lastUserMessageId,
    sendMessage,
    abortRequest,
  };
}
