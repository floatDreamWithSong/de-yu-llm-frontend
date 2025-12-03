import { request } from "@/lib/request";
import z from "zod";
import { ProfileSchema, UserProfileSchemaPartial, ParsedUserProfileSchema } from "./schema";
import { COTEA_ENUM } from "../conversation/enums/cotea";

export type RoleType = typeof COTEA_ENUM.UserProfileRoleEnum.keyType | null;

// 解析 role 字符串
// 学生: "一年级 学生"
// 教师: "一年级 语文 老师"
// 家长: "一年级 家长"
const parseRole = (
  role: string | null,
): {
  roleType: RoleType;
  grade: string | null;
  subject: string | null;
} => {
  if (!role) return { roleType: null, grade: null, subject: null };

  const parts = role.split(" ");
  if (parts.length < 2) return { roleType: null, grade: null, subject: null };

  const lastPart = parts[parts.length - 1];
  const grade = parts[0];

  if (lastPart === COTEA_ENUM.UserProfileRoleEnum.STUDENT) {
    return { roleType: COTEA_ENUM.UserProfileRoleEnum.keys[0], grade, subject: null };
  }
  if (lastPart === COTEA_ENUM.UserProfileRoleEnum.TEACHER) {
    // 教师格式: "年级 学科 老师"
    const subject = parts.length >= 3 ? parts[1] : null;
    return { roleType: COTEA_ENUM.UserProfileRoleEnum.keys[1], grade, subject };
  }
  if (lastPart === COTEA_ENUM.UserProfileRoleEnum.PARENT) {
    return { roleType: COTEA_ENUM.UserProfileRoleEnum.keys[2], grade, subject: null };
  }

  return { roleType: null, grade: null, subject: null };
};

export const updateProfile = (data: z.infer<typeof UserProfileSchemaPartial>) =>
  request({
    url: "/basic_user/update_profile",
    method: "POST",
    data,
    dataValidator: UserProfileSchemaPartial,
  }).then(()=>data)

export const getProfile = () =>
  request({
    url: "/basic_user/profile",
    method: "GET",
    responseValidator: z.object({
      name: z.string(),
      avatar: z.string(),
      profile: ProfileSchema,
    }).transform((data) => {
      const parsedRole = parseRole(data.profile.role);
      return {
        username: data.name,
        avatar: data.avatar,
        profile: {
          roleType: parsedRole.roleType,
          grade: parsedRole.grade,
          subject: parsedRole.subject,
        }
      };
    }).pipe(ParsedUserProfileSchema),
  })