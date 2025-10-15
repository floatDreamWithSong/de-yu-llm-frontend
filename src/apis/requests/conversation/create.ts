import { request } from "@/lib/request";
import z from "zod";

const RequestSchema = z.object({
  botId: z.string().optional(),
});

export const createConversation = (
  abort: AbortController,
  data: z.infer<typeof RequestSchema>,
) => {
  return request({
    url: "/conversation/create",
    method: "POST",
    data,
    dataValidator: RequestSchema,
    responseValidator: z.object({
      conversationId: z.string(),
    }),
    signal: abort.signal,
  });
};
