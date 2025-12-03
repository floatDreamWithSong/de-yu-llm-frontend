import z from "zod";

export const AuthInfoSchema = z.object({
  authId: z.string(),
  authType: z.union([z.literal("phone-verify"), z.literal("phone-password")]),
});
export const CredentialsSchema = z.object({
  token: z.string(),
});

export const UserProfileSchema = z.object({
  username: z.string(),
  avatar: z.string(),
  profile: z.object({
    role: z.string() // 一年级；（语文；老师）|（学生）|（家长）
  })
});
export const UserProfileSchemaPartial = UserProfileSchema.partial();
export type UserCredentials = z.infer<typeof CredentialsSchema>;

export const verifyCodeCauseSchema = z.union([z.literal("passport"), z.literal("password")]);
export const passwordSchema = z.string().min(6, "密码至少6位").max(20, "密码最多20位");