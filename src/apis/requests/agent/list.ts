import { request } from "@/lib/request";
import z from "zod";
import { agentListItemSchema } from "./schema";

export const RequestSchema = z.object({
  page: z.object({
    size: z.number(),
    cursor: z.string().optional()
  })
});

export const getAgentList = (data: z.infer<typeof RequestSchema>) => {
  return request({
    url: "/intelligence/list",
    method: "POST",
    data,
    dataValidator: RequestSchema,
    responseValidator: z.object({
      hasMore: z.boolean(),
      intelligences: z.array(agentListItemSchema),
    }),
  });
};
