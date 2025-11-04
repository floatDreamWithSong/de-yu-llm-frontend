import type z from "zod";
import { AuthInfoSchema, verifyCodeCauseSchema } from "./schema";
import { request } from "@/lib/request";

const verifyCodeSchema = AuthInfoSchema.extend({
  cause: verifyCodeCauseSchema,
});

export const sendVerificationCode = (data: z.infer<typeof verifyCodeSchema>) =>
  request({
    url: "/system/send_verify_code",
    method: "POST",
    data,
    dataValidator: verifyCodeSchema,
  });
