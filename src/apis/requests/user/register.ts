import z from "zod";
import { request } from "@/lib/request";
import { AuthInfoSchema, CredentialsSchema } from "./schema";

export const RegisterSchema = AuthInfoSchema.extend({
  verify: z.string(),
  password: z.string(),
});

export const registerByPhone = (data: z.infer<typeof RegisterSchema>) => {
  return request({
    url: "/basic_user/register",
    method: "POST",
    data,
    dataValidator: RegisterSchema,
    responseValidator: CredentialsSchema,
  });
};
