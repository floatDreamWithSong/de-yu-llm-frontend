import { z } from "zod";

export const PageSchema = z.object({
  cursor: z.string().optional(),
  size: z.number()
})

export const SseSearchCiteSchema = z.object({
  index: z.number(), // Int, 引用的索引
  name: z.string(), // St, 网页名称
  url: z.string(), // St, 网页连接
  snippet: z.string(), // St, 网页内容概要
  siteName: z.string(), // St, 站点名称
  siteIcon: z.string(), // St, 站点图片链接
  datePublished: z.string(), // St, 数据发布时间
});
export type SseSearchCite = z.infer<typeof SseSearchCiteSchema>;