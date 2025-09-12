import z from "zod";
import { ConversationSchema } from "./history";
import { request } from "@/lib/request";

export const PageSchema = z.object({
  cursor: z.number().optional(),
  size: z.number(),
});
export type Page = z.infer<typeof PageSchema>;

export const RequestSchema = z.object({
  key: z.string(),
  page: PageSchema,
});

export const ResponseSchema = z.object({
  conversations: z.array(ConversationSchema),
  hasMore: z.boolean(),
  cursor: z.number()
});

export function queryHistory(data: z.infer<typeof RequestSchema>) {
  return request({
    url: "/conversation/search",
    method: "POST",
    data,
    dataValidator: RequestSchema,
    responseValidator: ResponseSchema,
  });
}
