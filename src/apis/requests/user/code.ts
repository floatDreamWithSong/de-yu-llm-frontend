import type z from "zod";
import { AuthInfoSchema } from "./schema";
import { request } from "@/lib/request";

export const sendVerificationCode = (data: z.infer<typeof AuthInfoSchema>) =>
  request({
    url: "/system/send_verify_code",
    method: "POST",
    data,
    dataValidator: AuthInfoSchema,
  });
