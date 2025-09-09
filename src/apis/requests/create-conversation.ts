import { request } from "@/lib/request";
import z from "zod";

export const createConversation = () => {
  return request({
    url: "/v1/conversation/create",
    method: "POST",
    responseValidator: z.object({
      conversationId: z.string(),
      success: z.boolean().optional(),
    }),
  });
};