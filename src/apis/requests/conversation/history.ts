import { request } from "@/lib/request";
import z from "zod";

const RequestSchema = z.object({
  page: z.number(),
  pageSize: z.number(),
});
const ConversationSchema = z.object({
  conversationId: z.string(),
  brief: z.string(),
  createTime: z.number(),
  updateTime: z.number(),
});
const ResponseSchema = z.object({
  list: z.array(ConversationSchema),
});

export type Conversation = z.infer<typeof ConversationSchema>;

export function getConversationHistoryList(
  data: z.infer<typeof RequestSchema>,
) {
  return request({
    url: "/conversation/list",
    method: "POST",
    dataValidator: RequestSchema,
    data,
    responseValidator: ResponseSchema,
  });
}
