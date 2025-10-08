import z from "zod";

export const agentListItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.string(),
  description: z.string(),
  iconUrl: z.string(),
  createTime: z.string(),
  updateTime: z.string(),
  publishTime: z.string(),
});
export type AgentListItem = z.infer<typeof agentListItemSchema>;
export const PromptInfoSchema = z.object({
  prompt: z.string(),
});
export const OnboardingInfoSchema = z.object({
  prologue: z.string(),
  suggestedQuestionsShowMode: z.number(),
});
export const ShortMemoryPolicySchema = z.object({
  historyRound: z.number(),
});
export const ModelInfoSchema = z.object({
  maxTokens: z.number(),
  modelId: z.string(),
  modelStyle: z.number(),
  shortMemoryPolicy: ShortMemoryPolicySchema,
  temperature: z.number(),
  topP: z.number(),
});
export const AgentInfoSchema = z.object({
  backgroundImageInfo: z.string(),
  botId: z.string(),
  botMode: z.number(),
  createTime: z.number(),
  defaultUserInputType: z.string(),
  description: z.string(),
  iconUrl: z.string(),
  modelInfo: ModelInfoSchema,
  name: z.string(),
  onboardingInfo: OnboardingInfoSchema,
  pluginInfoList: z.array(z.string()),
  promptInfo: PromptInfoSchema,
  shortcutCommands: z.string(),
  suggestReplyInfo: z.string(),
  type: z.string(),
  updateTime: z.number(),
  variables: z.string(),
  version: z.string(),
  workflowInfoList: z.array(z.string()),
});
export type AgentInfo = z.infer<typeof AgentInfoSchema>;
