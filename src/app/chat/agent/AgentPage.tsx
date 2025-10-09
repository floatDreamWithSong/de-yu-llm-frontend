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
import { Link, useNavigate, useSearch } from "@tanstack/react-router";
import {
  Empty,
  EmptyDescription,
  EmptyTitle,
  EmptyMedia,
  EmptyHeader,
} from "@/components/ui/empty";
import {
  Pagination,
  PaginationNext,
  PaginationItem,
  PaginationContent,
  PaginationEllipsis,
  PaginationPrevious,
  PaginationLink,
} from "@/components/ui/pagination";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";

const AgentPage = () => {
  // const agentListQuery = useInfiniteQuery({
  //   initialPageParam: void 0 as string | undefined,
  //   queryKey: [ClientQueryKeys.agent],
  //   queryFn: ({ pageParam: cursor }) => {
  //     return getAgentList({
  //       page: {
  //         size: 50,
  //         cursor,
  //       },
  //     });
  //   },
  //   staleTime: 60 * 1000,
  //   getNextPageParam: (lastPage) =>
  //     lastPage.hasMore ? lastPage.nextCursor : undefined,
  // });
  const agentListQuery = useInfiniteQuery({
    initialPageParam: void 0 as string | undefined,
    queryKey: [ClientQueryKeys.agent],
    queryFn: ({ pageParam: cursor }) => {
      return getAgentList({
        page: {
          size: 160,
          cursor,
        },
      });
    },
    staleTime: Number.POSITIVE_INFINITY,
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? lastPage.nextCursor : undefined,
  });
  const [checkedType, setCheckedType] = useState("");
  const agentListData =
    agentListQuery.data?.pages
      .flatMap((page) => page.intelligences)
      .filter((item) => checkedType === "" || item.type === checkedType) ?? [];
  const total = agentListData.length;
  const { page = 1, size = 30 } = useSearch({
    from: "/_authenticated/chat/agent",
  });
  const maxPagge = Math.ceil(total / size);
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
  return (
    <div className="overflow-auto h-screen style__scroller-none relative">
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
        {agentListData.slice((page - 1) * size, page * size).map((item) => (
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
                  <img className="grayscale" src="/logo.svg" alt="innospark" />
                </Icon>
              </EmptyMedia>
              <EmptyTitle>暂无数据</EmptyTitle>
              <EmptyDescription>这里空空如也~</EmptyDescription>
            </EmptyHeader>
          </Empty>
        )}
      </section>
      <Pagination className="my-8 justify-end -ml-6">
        <PaginationContent>
          {page > 1 && (
            <PaginationItem>
              <Link to="/chat/agent" search={{ page: page - 1, size }}>
                <PaginationPrevious>
                  <ChevronLeftIcon />
                </PaginationPrevious>
              </Link>
            </PaginationItem>
          )}
          {page > 2 && (
            <PaginationItem>
              <PaginationEllipsis />
            </PaginationItem>
          )}
          {page > 1 && (
            <PaginationItem>
              <Link to="/chat/agent" search={{ page: page - 1, size }}>
                <PaginationLink>{page - 1}</PaginationLink>
              </Link>
            </PaginationItem>
          )}
          <PaginationItem>
            <PaginationLink isActive>{page}</PaginationLink>
          </PaginationItem>
          {page + 1 <= maxPagge && (
            <PaginationItem>
              <Link to="/chat/agent" search={{ page: page + 1, size }}>
                <PaginationLink>{page + 1}</PaginationLink>
              </Link>
            </PaginationItem>
          )}
          {page + 2 < maxPagge && (
            <PaginationItem>
              <PaginationEllipsis />
            </PaginationItem>
          )}
          {page + 1 <= maxPagge && (
            <PaginationItem>
              <Link to="/chat/agent" search={{ page: page + 1, size }}>
                <PaginationNext>
                  <ChevronRightIcon />
                </PaginationNext>
              </Link>
            </PaginationItem>
          )}
        </PaginationContent>
      </Pagination>


      {/* <div
          ref={bottomRef}
          className="text-center text-muted-foreground text-sm my-6 min-h-1"
        >
          {agentListQuery.hasNextPage && agentListQuery.isFetchingNextPage && (
            <div>加载中...</div>
          )}
          {!agentListQuery.hasNextPage &&
            !agentListQuery.isFetchingNextPage && <div>没有更多了~</div>}
        </div> */}
    </div>
  );
};

export default AgentPage;
