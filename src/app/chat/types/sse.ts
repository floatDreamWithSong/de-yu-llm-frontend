import type {
  SseEditorCode,
  SseSearchCite,
} from "@/apis/requests/conversation/schema";

// 后端 SSE 单帧 payload
export interface SseChat {
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
export interface SseMeta {
  messageId: string;
  conversationId: string;
  sectionId: string;
  messageIndex: number;
  conversationType: number;
  replyId: string;
}
export interface SseModel {
  model: string;
  bot_id: string;
  bot_name: string;
}
export interface SseError {
  code: number;
  msg: string;
}

interface Chunk<E extends string, D> {
  id: number;
  event: E;
  data: D;
}
export type StreamChunk =
  | Chunk<"meta", SseMeta>
  | Chunk<"model", SseModel>
  | Chunk<"chat", SseChat>
  | Chunk<"end", unknown>
  | Chunk<"searchStart", unknown>
  | Chunk<"searchFind", number>
  | Chunk<"searchChoice", number>
  | Chunk<"searchCite", SseSearchCite>
  | Chunk<"searchEnd", unknown>
  | Chunk<"error", SseError>;

export interface TextContent {
  text?: string;
  think?: string;
  codeType?: SseEditorCode["codeType"];
  code?: string;
  suggest?: string;
}
