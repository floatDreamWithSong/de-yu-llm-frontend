import ClientQueryKeys from "@/apis/queryKeys";
import { getAgentInfo } from "@/apis/requests/agent/info";
import { isBuiltInAgent } from "@/lib/constants";
import { useQuery } from "@tanstack/react-query";

export const useBotInfo = (props: { botId?: string }) => {
  const enabledQuery =
    props.botId !== undefined && !isBuiltInAgent(props.botId);
  return useQuery({
    queryKey: [ClientQueryKeys.agent.agentInfo, props.botId],
    queryFn: () => {
      if (!props.botId) {
        throw Error("未知的botId");
      }
      return getAgentInfo({ id: props.botId });
    },
    select: (e) => e?.info,
    enabled: enabledQuery,
    staleTime: Number.POSITIVE_INFINITY,
  });
};

export const useBotBasicInfo = (botId?: string) => {
  const info = useBotInfo({ botId });
  const defaultData = {
    iconUrl: "/logo.svg",
    name: botId,
  };
  if (isBuiltInAgent(botId)) {
    return defaultData;
  }
  return {
    iconUrl: info.data?.iconUrl ?? defaultData.iconUrl,
    name: info.data?.name,
  };
};

export const formatBotId = (botId?: string) => {
  return {
    raw: botId,
    normal: isBuiltInAgent(botId)
      ? (botId ?? "default")
      : `intelligence-${botId}`,
  };
};
