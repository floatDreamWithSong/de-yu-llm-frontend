import { request } from "@/lib/request";
import z from "zod";
import { AgentInfoSchema } from "./schema";

const RequestSchema = z.object({
  id: z.string(),
});

export const getAgentInfo = (data: z.infer<typeof RequestSchema>) => {
  return request({
    url: "/intelligence/get",
    method: "POST",
    dataValidator: RequestSchema,
    data,
    responseValidator: z.object({
      info: AgentInfoSchema,
    }),
  });
};
