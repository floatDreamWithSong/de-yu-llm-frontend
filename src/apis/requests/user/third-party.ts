import z from "zod";
import { request } from "@/lib/request";
import { CredentialsSchema, UserProfileSchema } from "./schema";

export const RequestSchema = z.object({
  ticket: z.string(),
  thirdparty: z.string(),
})

export const RequestThirdPartyLogin = (data: z.infer<typeof RequestSchema>) => {
  return request({
    url: "/thirdparty/login",
    method: "POST",
    data,
    dataValidator: RequestSchema,
    responseValidator: CredentialsSchema.and(UserProfileSchema)
  })
};
