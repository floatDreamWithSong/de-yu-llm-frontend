import ClientQueryKeys from "@/apis/queryKeys";
import { getAgentList } from "@/apis/requests/agent/list";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Icon } from "@radix-ui/react-select";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import agentPageBg from "@/assets/imgs/agent-page.png";
import { Button } from "@/components/ui/button";
import { useNavigate } from "@tanstack/react-router";
import {
  Empty,
  EmptyDescription,
  EmptyTitle,
  EmptyMedia,
  EmptyHeader,
} from "@/components/ui/empty";

const AgentPage = () => {
  const agentListQuery = useInfiniteQuery({
    initialPageParam: void 0 as string | undefined,
    queryKey: [ClientQueryKeys.agent],
    queryFn: ({ pageParam: cursor }) => {
      return getAgentList({
        page: {
          size: 50,
          cursor,
        },
      });
    },
    staleTime: 60 * 1000,
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? lastPage.nextcursor : undefined,
  });
  const bottomRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const el = bottomRef.current;
    if (!el) return;
    const observer = new IntersectionObserver((entries) => {
      const entry = entries[0];
      if (entry.isIntersecting) {
        agentListQuery.fetchNextPage();
      }
    });
    console.log("trigger");
    observer.observe(el);
    return () => {
      console.log("disconnect");
      observer.disconnect();
    };
  }, [agentListQuery.fetchNextPage]);
  const avaliableType = agentListQuery.data?.pages
    .flatMap((page) => page.intelligences)
    .map((item) => item.type);
  const filteredTypes = Array.from(new Set(avaliableType));
  const [checkedType, setCheckedType] = useState("");
  const navigate = useNavigate();
  // const setCompletionConfig = useChatStore((s) => s.setCompletionConfig);
  const handleCardClick = (botId: string) => {
    console.log(botId);
    navigate({
      to: "/chat/agent/chat/$agentId",
      params: {
        agentId: botId,
      },
    });
  };
  const agentListData =
    agentListQuery.data?.pages
      .flatMap((page) => page.intelligences)
      .filter((item) => checkedType === "" || item.type === checkedType) ?? [];
  return (
    <div className="overflow-auto h-full style__scoller-none">
      <div className="">
        <section
          style={{
            backgroundImage: `url(${agentPageBg})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
          className="h-64 w-full flex flex-col items-center justify-center "
        >
          <h1 className="text-4xl font-bold text-primary mb-2">
            InnoSpark · 智能助手
          </h1>
          <h2 className="text-lg text-muted-foreground">
            选择适合您需求的智能助手功能，提升工作与学习效率
          </h2>
        </section>
        <section className="flex gap-2 px-6 pt-6">
          <Button
            variant={checkedType === "" ? "default" : "secondary"}
            size={"sm"}
            onClick={() => setCheckedType("")}
          >
            全部
          </Button>
          {filteredTypes.map((type) => (
            <Button
              variant={checkedType === type ? "default" : "secondary"}
              key={type}
              size={"sm"}
              onClick={() => setCheckedType(type)}
            >
              {type}
            </Button>
          ))}
        </section>
        <section className="px-6 pt-6 flex flex-wrap gap-4">
          {agentListData.map((item) => (
            <Card
              key={item.id}
              onClick={() => handleCardClick(item.id)}
              className="w-80 aspect-video gap-2 py-4 cursor-pointer hover:scale-102 transition-transform duration-300"
            >
              <CardHeader className="flex items-center">
                <Icon className="size-10 flex items-center justify-center bg-secondary rounded-md">
                  <img src={item.iconUrl} alt={item.name} />
                </Icon>
                <CardTitle className="text-xl">{item.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="overflow-hidden text-ellipsis line-clamp-4">
                  {item.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
          {(!agentListQuery.isSuccess || agentListData.length === 0) && (
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <Icon>
                    <img
                      className="grayscale"
                      src="/logo.svg"
                      alt="innospark"
                    />
                  </Icon>
                </EmptyMedia>
                <EmptyTitle>暂无数据</EmptyTitle>
                <EmptyDescription>这里空空如也~</EmptyDescription>
              </EmptyHeader>
            </Empty>
          )}
        </section>
        <div
          ref={bottomRef}
          className="text-center text-muted-foreground text-sm my-6 min-h-1"
        >
          {agentListQuery.hasNextPage && agentListQuery.isFetchingNextPage && (
            <div>加载中...</div>
          )}
          {!agentListQuery.hasNextPage &&
            !agentListQuery.isFetchingNextPage && <div>没有更多了~</div>}
        </div>
      </div>
    </div>
  );
};

export default AgentPage;
