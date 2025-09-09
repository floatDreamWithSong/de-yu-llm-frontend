import type { Request } from "@/apis/requests/completion";
import { useState, useCallback, useRef } from "react";

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
}

export interface CompletionRequest extends Request {}

export function useStreamCompletion(conversationId: string) {
  const [isStreaming, setIsStreaming] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const abortControllerRef = useRef<AbortController | null>(null);

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
      return newMessage.id;
    },
    [],
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
      setIsStreaming(false);
    }
  }, []);

  const sendMessage = useCallback(
    async (content: string) => {
      if (isStreaming || !conversationId) return;

      // 取消之前的请求
      if (abortControllerRef.current) {
        console.log("取消之前的请求");
        abortControllerRef.current.abort();
      }

      // 创建新的AbortController
      const newAbortController = new AbortController();
      abortControllerRef.current = newAbortController;

      setIsStreaming(true);
      let aiMessageId = "";

      try {
        // 添加用户消息
        addMessage(content, "user");

        const requestData: CompletionRequest = {
          messages: [
            {
              content,
              contentType: 0,
              attaches: [],
              references: [],
              role: "user",
            },
          ],
          completionsOption: {
            isRegen: false,
            withSuggest: false,
            isReplace: false,
            useDeepThink: false,
            stream: true,
          },
          model: "deyu-default",
          conversationId,
          botId: "default",
        };

        console.log("发送请求:", requestData);
        const response = await fetch("http://localhost:3001/v1/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestData),
          signal: newAbortController.signal,
        });

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
        setIsStreaming(false);
        abortControllerRef.current = null;
        // 完成流式输出
        modifyMessage(aiMessageId, { isStreaming: false });
      }
    },
    [
      isStreaming,
      conversationId,
      addMessage,
      modifyMessage,
      accumulativeMessage,
    ],
  );

  return {
    isStreaming,
    messages,
    sendMessage,
    abortRequest,
  };
}
