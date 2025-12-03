export const CoteaBotIds = [
  'cotea-InterdisciplinaryTeachingPlan',
  'cotea-PersonalizedKnowledgeExplanation',
  'cotea-GuidedTeaching',
  'cotea-ContextualizedQuestion',
] as const;

export type CoteaBotIdType = (typeof CoteaBotIds)[number];
// 1. 跨学科教案生成 [InterdisciplinaryTeachingPlan]

import z from "zod";
import { COTEA_ENUM } from "../enums/cotea";

/***
 * - subject: 副学科名称, example: 历史, 地理, 应该不能默认, 必须选择
- time: 课时数, example: 两个课时, 默认一个课时
- feature: 学生特点, example: 喜欢听故事, 默认无
 */

export const InterdisciplinaryTeachingPlanSchema = z.object({
  coteaId: z.literal(CoteaBotIds[0]),
  subject: z.string(),
  time: z.string().default('1'),
  feature: z.string().optional(),
});

// 2. 个性化知识讲解 [PersonalizedKnowledgeExplanation]
/**
 * level: 知识基础, 零基础/入门级/进阶级/复习巩固, 默认进阶
 * style: 讲解风格, 生活案例/公式推导/可视化比喻/步骤拆解/故事化讲解
 */

export const PersonalizedKnowledgeExplanationSchema = z.object({
  coteaId: z.literal(CoteaBotIds[1]),
  level: z.string().default(COTEA_ENUM.KnowledgeHandleLevelEnum.keys[2]),
  style: z.string(),
});

// GuidedTeaching
/**
 level: 零基础/入门级/进阶级/复习巩固, 默认进
 * 
 */

export const GuidedTeachingSchema = z.object({
  coteaId: z.literal(CoteaBotIds[2]),
  level: z.string().default(COTEA_ENUM.KnowledgeHandleLevelEnum.keys[2]),
});

export const placeholderInterest = [
  "王者荣耀",
  "原神",
  "篮球",
  "羽毛球",
  "校园手账",
  "文具收藏",
  "美食",
  "DIY",
  "动漫追剧",
  "跳绳",
  "Scratch编程",
  "手抄报制作",
  "桌游三国杀",
  "流行音乐",
  "手工折纸",
  "校园露营",
  "宠物养猫",
  "星座",
];

/**
 * ContextualizedQuestion
interest: , 可以自定义添加
 */

export const ContextualizedQuestionSchema = z.object({
  coteaId: z.literal(CoteaBotIds[3]),
  interest: z.array(z.string()),
});

export type CoteaConfigType =
  | z.infer<typeof InterdisciplinaryTeachingPlanSchema>
  | z.infer<typeof PersonalizedKnowledgeExplanationSchema>
  | z.infer<typeof GuidedTeachingSchema>
  | z.infer<typeof ContextualizedQuestionSchema>;
