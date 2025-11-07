import { request } from "@/lib/request";
import z from "zod";
import { UserProfileSchemaPartial } from "./schema";


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
    }).transform((data) => ({
      username: data.name,
      avatar: data.avatar,
    })),
  })