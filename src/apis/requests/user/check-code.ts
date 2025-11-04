import { request } from "@/lib/request";
import { AuthInfoSchema, verifyCodeCauseSchema } from "./schema";
import z from "zod";


const checkCodeSchema = AuthInfoSchema.extend({
  cause: verifyCodeCauseSchema,
  verify: z.string(),
});

export const checkCode = (data: z.infer<typeof checkCodeSchema>) => {
  return request({
    url: "/system/check_verify_code",
    method: "POST",
    data,
    dataValidator: checkCodeSchema,
  });
};