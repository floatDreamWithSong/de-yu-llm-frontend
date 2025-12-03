import z from "zod";
import { COTEA_ENUM } from "../../conversation/enums/cotea";

export const AuthInfoSchema = z.object({
  authId: z.string(),
  authType: z.union([z.literal("phone-verify"), z.literal("phone-password")]),
});
export const CredentialsSchema = z.object({
  token: z.string(),
});

export const ProfileSchema = z.object({
  /** 
   * 示例值：
   * 一年级 学生 
   * 一年级 语文 老师
   * 一年级 家长
   */
  role: z.string().nullable(),
});

// 解析后的 Profile 数据结构
export const ParsedProfileSchema = z.object({
  roleType: z.union([
    z.literal(COTEA_ENUM.UserProfileRoleEnum.keys[0]),
    z.literal(COTEA_ENUM.UserProfileRoleEnum.keys[1]),
    z.literal(COTEA_ENUM.UserProfileRoleEnum.keys[2]),
  ]).nullable(),
  grade: z.string().nullable(),
  subject: z.string().nullable(),
});

export const UserProfileSchema = z.object({
  username: z.string(),
  avatar: z.string(),
  profile: ProfileSchema,
});

// 解析后的用户资料 Schema
export const ParsedUserProfileSchema = z.object({
  username: z.string(),
  avatar: z.string(),
  profile: ParsedProfileSchema,
});

export const UserProfileSchemaPartial = UserProfileSchema.extend({
  profile: ProfileSchema.partial().optional(),
}).partial();
export type UserCredentials = z.infer<typeof CredentialsSchema>;

export const verifyCodeCauseSchema = z.union([
  z.literal("passport"),
  z.literal("password"),
]);
export const passwordSchema = z
  .string()
  .min(6, "密码至少6位")
  .max(20, "密码最多20位");
