import { request } from "@/lib/request";

export function getConversationHistoryList(){
  return request({
    url: "/conversation/list",
    method: "POST",
  });
}