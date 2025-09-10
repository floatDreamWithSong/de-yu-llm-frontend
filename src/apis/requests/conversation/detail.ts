import { request } from "@/lib/request";
import z from "zod";

export const PageSchema = z.object({
  page: z.number(),
  size: z.number(),
});
export type Page = z.infer<typeof PageSchema>;

export const RequestSchema = z.object({
  conversationId: z.string(),
  page: PageSchema,
});

export const ExtSchema = z.object({
  botState: z.string(),
  brief: z.string(),
  suggest: z.string(),
  think: z.string(),
});
export type Ext = z.infer<typeof ExtSchema>;

export const MessageListSchema = z.object({
  content: z.string(),
  contentType: z.number(),
  conversationId: z.string(),
  createTime: z.number(),
  ext: ExtSchema,
  feedback: z.number(),
  index: z.number(),
  messageId: z.string(),
  messageType: z.number(),
  replyId: z.union([z.null(), z.string()]),
  sectionId: z.string(),
  status: z.number(),
  userType: z.number().transform((value) => {
    return value === 2 ? "user" : "assistant";
  }),
});
export type MessageList = z.infer<typeof MessageListSchema>;

export const DataSchema = z.object({
  hasMore: z.boolean(),
  messageList: z.array(MessageListSchema).nullable(),
  regenList: z.null(),
});

export function getConversationDetail(data: z.infer<typeof RequestSchema>) {
  return request({
    url: "/conversation/get",
    method: "POST",
    dataValidator: RequestSchema,
    data,
    responseValidator: DataSchema,
  });
}
