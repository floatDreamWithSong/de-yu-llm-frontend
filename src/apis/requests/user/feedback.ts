import { request } from "@/lib/request";

export function feedbackContent(content: string) {
  return request({
    method: "POST",
    url: "/feedback/content",
    data: { content, type: 4, action: 0, messageId: "" },
  });
}
