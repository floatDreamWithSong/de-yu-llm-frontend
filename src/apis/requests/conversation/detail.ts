import { request } from "@/lib/request";

export function getConversationDetail(){
  return request({
    url: "/conversation/get",
    method: "POST",
  });
}