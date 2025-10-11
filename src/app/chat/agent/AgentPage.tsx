import ClientQueryKeys from "@/apis/queryKeys";
import { getAgentList } from "@/apis/requests/agent/list";
import {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  LinkCard,
} from "@/components/ui/card";
import { Icon } from "@radix-ui/react-select";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useRef } from "react";
import agentPageBg from "@/assets/imgs/agent-page.png";
import { Button } from "@/components/ui/button";
import {
  Link,
  useNavigate,
  useSearch,
} from "@tanstack/react-router";
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
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useTitleAni } from "@/hooks/use-title-ani";
/**
 * 语文
数学
政治
英语
生物
化学
物理
历史
地理
技能素养
学习辅导
教师支持
 */
const agentTypeList = [
  "语文",
  "数学",
  "政治",
  "英语",
  "生物",
  "化学",
  "物理",
  "历史",
  "地理",
  "技能素养",
  "学习辅导",
  "教师支持",
];
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
  const {
    page = 1,
    size = 32,
    botType = "",
  } = useSearch({
    from: "/_authenticated/chat/agent",
  });
  const agentListData =
    agentListQuery.data?.pages
      .flatMap((page) => page.intelligences)
      .filter((item) => botType === "" || item.type === botType) ?? [];
  const total = agentListData.length;
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
  // const avaliableType = agentListQuery.data?.pages
  //   .flatMap((page) => page.intelligences)
  //   .map((item) => item.type);
  // const filteredTypes = Array.from(new Set(avaliableType));
  const navigate = useNavigate();
  // const setCompletionConfig = useChatStore((s) => s.setCompletionConfig);
  const agentSlice = useMemo(
    () => agentListData.slice((page - 1) * size, page * size),
    [page, size, agentListData],
  );
  useGSAP(() => {
    if (!agentSlice.length) return;
    gsap.killTweensOf(".agent-slice-card");
    gsap.from(".agent-slice-card", {
      opacity: 0,
      translateY: 20,
      duration: 0.3,
      stagger: 0.02,
      ease: "power3.inOut",
    });
  }, [agentSlice]);
  useGSAP(() => {
    gsap.killTweensOf(".agent-page-type-list-btn");
    gsap.from(".agent-page-type-list-btn", {
      opacity: 0,
      translateX: 20,
      scale: 0.8,
      duration: 0.3,
      stagger: 0.03,
      delay: 0.1,
      ease: "power3.inOut",
    });
  }, []);
  useTitleAni({ title: ".agent-page-title", subtitle: ".agent-page-subtitle" });
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
        <h1 className="agent-page-title text-4xl font-bold text-primary mb-2">
          InnoSpark · 智能助手
        </h1>
        <h2 className="agent-page-subtitle text-lg text-muted-foreground">
          选择适合您需求的智能助手功能，提升工作与学习效率
        </h2>
      </section>
      <div className="w-full flex flex-col items-center max-w-400 mx-auto @container">
        <section className="flex flex-wrap gap-2 px-6 pt-6 pb-2 overflow-x-scroll w-full justify-center">
          <Button
            variant={botType === "" ? "default" : "secondary"}
            size={"sm"}
            className="agent-page-type-list-btn transition-colors"
            onClick={() =>
              navigate({ to: "/chat/agent", search: { page: 1, size } })
            }
          >
            全部
          </Button>
          {agentTypeList.map((type) => (
            <Button
              variant={botType === type ? "default" : "secondary"}
              key={type}
              size={"sm"}
              className="hover:scale-105 agent-page-type-list-btn transition-colors"
              onClick={() =>
                navigate({
                  to: "/chat/agent",
                  search: { page: 1, size, botType: type },
                })
              }
            >
              {type}
            </Button>
          ))}
        </section>
        <section className="relative mt-2 px-6 pt-6 grid gap-4 grid-cols-1 @xl:grid-cols-2 @4xl:grid-cols-3 @6xl:grid-cols-4">
          {agentSlice.map((item) => (
            <LinkCard
              to="/chat/agent/chat/$agentId"
              params={{
                agentId: item.id,
              }}
              key={item.id}
              className="agent-slice-card transition-colors w-full gap-2 py-4 cursor-pointer hover:bg-secondary/50 duration-300"
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
            </LinkCard>
          ))}
          {(!agentListQuery.isSuccess || agentListData.length === 0) && (
            <Empty className="col-span-4">
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
      </div>
      <Pagination className="my-8 justify-end -ml-6">
        {maxPagge > 1 && (
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
        )}
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
