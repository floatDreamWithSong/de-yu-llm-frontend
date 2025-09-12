import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import {
  BotIcon,
  Edit,
  LoaderCircle,
  LogOut,
  MessageCircleMoreIcon,
  MoreHorizontal,
  SearchIcon,
  Settings,
  Trash2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  getConversationHistoryList,
  type Conversation,
} from "@/apis/requests/conversation/history";
import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
  type InfiniteData,
} from "@tanstack/react-query";
import groupConversationsByDate from "@/utils/date-group";
import { renameConversation } from "@/apis/requests/conversation/rename";
import { useCallback, useEffect, useRef, useState } from "react";
import ClientQueryKeys from "@/apis/requests/queryKeys";
import { queryHistory } from "@/apis/requests/conversation/query";
import { deleteConversation } from "@/apis/requests/conversation/delete";
import { cn } from "@/lib/utils";
import { useInitMessageStore } from "@/store/initMessage";

export default function ChatSidebar() {
  const { state } = useSidebar();
  const navigate = useNavigate();
  const location = useLocation();
  const matchRouteId = location.pathname.startsWith("/chat/agent")
    ? "agent"
    : location.pathname.startsWith("/chat/database")
      ? "database"
      : "chat";
  const [renamingItemId, setRenamingItemId] = useState("");
  const [tempTitle, setTempTitle] = useState("");
  const [seacherQueryKey, setSearchQueryKey] = useState("");
  const queryClient = useQueryClient();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const { reset } = useInitMessageStore();
  const {
    data: conversationHistory,
    isLoading,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery<
    { conversations: Conversation[]; cursor: string; hasMore: boolean },
    Error,
    Conversation[],
    [string, string],
    string | null
  >({
    queryKey: [
      ClientQueryKeys.consversation.conversationHistory,
      seacherQueryKey,
    ],
    queryFn: ({ pageParam }) => {
      const cursor = pageParam ?? undefined;
      if (!seacherQueryKey) {
        return getConversationHistoryList({
          page: { size: 15, cursor },
        });
      }
      return queryHistory({
        key: seacherQueryKey,
        page: {
          size: 20,
          cursor,
        },
      });
    },
    getNextPageParam: (lastPage) => (lastPage.hasMore ? lastPage.cursor : null),
    initialPageParam: null,
    select: (data) => data.pages.flatMap((page) => page.conversations),
  });

  // 底部哨兵元素引用
  const bottomSentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const sentinel = bottomSentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (
          entry.isIntersecting &&
          hasNextPage &&
          !isFetchingNextPage &&
          !isLoading
        ) {
          fetchNextPage();
        }
      },
      {
        root: scrollContainerRef.current,
        threshold: 0.1,
      },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, isLoading, fetchNextPage]);
  const handleChangeSearchKey = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const nextKey = e.target.value;
      setSearchQueryKey(nextKey);
      // 重置游标并清空缓存，确保使用新的搜索关键字重新开始分页
      queryClient.removeQueries({
        queryKey: [ClientQueryKeys.consversation.conversationHistory],
      });
    },
    [queryClient],
  );
  const renameMutation = useMutation({
    mutationFn: renameConversation,
    onMutate: async (variables) => {
      await queryClient.cancelQueries({
        queryKey: [ClientQueryKeys.consversation.conversationHistory],
      });
      type Page = { conversations: Conversation[] };
      type Data = InfiniteData<Page, number>;
      const previousData = queryClient.getQueryData<Data>([
        ClientQueryKeys.consversation.conversationHistory,
      ]);
      // 更新底层无限列表的 pages 结构
      queryClient.setQueryData<Data>(
        [ClientQueryKeys.consversation.conversationHistory],
        (oldData) => {
          if (!oldData) return oldData;
          if (Array.isArray(oldData.pages)) {
            return {
              ...oldData,
              pages: oldData.pages.map((page) => ({
                ...page,
                conversations: page.conversations.map((c) =>
                  c.conversationId === variables.conversationId
                    ? { ...c, brief: variables.brief }
                    : c,
                ),
              })),
            };
          }
          return oldData;
        },
      );
      return { previousData };
    },
    onError: (_err, _variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(
          [ClientQueryKeys.consversation.conversationHistory],
          context.previousData,
        );
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: [ClientQueryKeys.consversation.conversationHistory],
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteConversation,
    onMutate: async (variables: { conversationId: string }) => {
      await queryClient.cancelQueries({
        queryKey: [ClientQueryKeys.consversation.conversationHistory],
      });

      type Page = { conversations: Conversation[] };
      type Data = InfiniteData<Page, number>;
      const previousData = queryClient.getQueryData<Data>([
        ClientQueryKeys.consversation.conversationHistory,
      ]);

      // 如果当前正处于被删除的会话，立即跳回 /chat
      if (location.pathname.includes(variables.conversationId)) {
        reset();
        navigate({ to: "/chat" });
      }

      queryClient.setQueryData<Data>(
        [ClientQueryKeys.consversation.conversationHistory],
        (oldData) => {
          if (!oldData) return oldData;
          if (Array.isArray(oldData.pages)) {
            return {
              ...oldData,
              pages: oldData.pages.map((page) => ({
                ...page,
                conversations: page.conversations.filter(
                  (c) => c.conversationId !== variables.conversationId,
                ),
              })),
            };
          }
          return oldData;
        },
      );

      return { previousData };
    },
    onError: (_err, _variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(
          [ClientQueryKeys.consversation.conversationHistory],
          context.previousData,
        );
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: [ClientQueryKeys.consversation.conversationHistory],
      });
    },
  });

  function startRename(conversationId: string, currentTitle: string) {
    setRenamingItemId(conversationId);
    setTempTitle(currentTitle);
  }

  function cancelRename() {
    setRenamingItemId("");
    setTempTitle("");
  }

  function commitRename(conversationId: string) {
    const nextTitle = tempTitle.trim();
    if (!nextTitle) {
      cancelRename();
      return;
    }
    // 如果没有变化则直接退出编辑态
    const original = (conversationHistory ?? []).find(
      (c) => c.conversationId === conversationId,
    );
    if (original && original.brief === nextTitle) {
      cancelRename();
      return;
    }

    renameMutation.mutate({ conversationId: conversationId, brief: nextTitle });
    cancelRename();
  }
  function handleDeleteConversation(id: string) {
    deleteMutation.mutate({ conversationId: id });
  }
  return (
    <Sidebar
      className="px-2 pb-0 pt-10 ease-out duration-400 style__shallow-shadow style__scoller"
      variant="inset"
    >
      <SidebarHeader className="space-y-4">
        <div className="flex items-center justify-around px-2 gap-2">
          <div className="flex items-center gap-2">
            <img src="/logo.svg" alt="logo" />
            <h2 className="text-primary font-semibold text-2xl">
              启创·<span className="text-xl">InnoSpark</span>
            </h2>
          </div>
          {state === "expanded" && (
            <SidebarTrigger
              className="self-end"
              icon={<img src="/collapse.svg" alt="collapse" />}
            />
          )}
        </div>
        <div className="px-3 space-y-4 flex flex-col my-6">
          <Button
            className={cn([
              "rounded-full text-lg ",
              matchRouteId !== "chat" ? "bg-gray-100 text-[#545469]" : "",
            ])}
            size={"lg"}
            variant={"secondary"}
            onClick={() => {
              navigate({ to: "/chat" });
            }}
          >
            <MessageCircleMoreIcon className="stroke-2 size-5" />
            开始对话
          </Button>
          <Button
            className={cn([
              "rounded-full text-lg ",
              matchRouteId !== "agent" ? "bg-gray-100 text-[#545469]" : "",
            ])}
            size={"lg"}
            variant={"secondary"}
            onClick={() => {
              navigate({ to: "/chat/agent" });
            }}
          >
            <BotIcon className="stroke-2 size-5" />
            智能助手
          </Button>
          <Button
            className={cn([
              "rounded-full text-lg ",
              matchRouteId !== "database" ? "bg-gray-100 text-[#545469]" : "",
            ])}
            size={"lg"}
            variant={"secondary"}
            onClick={() => {
              navigate({ to: "/chat/database" });
            }}
          >
            <MessageCircleMoreIcon className="stroke-2 size-5" />
            <div className="mr-4">知识库</div>
          </Button>
        </div>
      </SidebarHeader>
      <SidebarContent className="px-3" ref={scrollContainerRef}>
        {isLoading ? (
          <div className="w-full justify-center flex">
            <LoaderCircle className="animate-spin duration-500 stroke-primary" />
          </div>
        ) : (
          <>
            {groupConversationsByDate(conversationHistory ?? []).map((item) => (
              <SidebarGroup key={item.label}>
                <SidebarGroupLabel>{item.label}</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {item.list.map((item) => (
                      <SidebarMenuItem
                        key={item.conversationId}
                        className="flex justify-between"
                      >
                        {renamingItemId === item.conversationId ? (
                          <Input
                            autoFocus
                            value={tempTitle}
                            onChange={(e) => setTempTitle(e.target.value)}
                            onBlur={() => commitRename(item.conversationId)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                commitRename(item.conversationId);
                              }
                              if (e.key === "Escape") {
                                e.preventDefault();
                                cancelRename();
                              }
                            }}
                            className="h-8 px-2"
                          />
                        ) : (
                          <SidebarMenuButton asChild>
                            <Link
                              onClick={reset}
                              to={`/chat/$conversationId`}
                              params={{ conversationId: item.conversationId }}
                            >
                              <span>{item.brief}</span>
                            </Link>
                          </SidebarMenuButton>
                        )}
                        {renamingItemId !== item.conversationId && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <SidebarMenuAction>
                                <MoreHorizontal />
                              </SidebarMenuAction>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent side="right" align="start">
                              <DropdownMenuItem
                                onClick={() =>
                                  startRename(item.conversationId, item.brief)
                                }
                              >
                                <Edit className="mr-2 h-4 w-4" />
                                <span>编辑标题</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={handleDeleteConversation.bind(
                                  null,
                                  item.conversationId,
                                )}
                                variant="destructive"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                <span>删除对话</span>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            ))}

            {isFetchingNextPage && (
              <div className="w-full justify-center flex py-4">
                <LoaderCircle className="animate-spin duration-500 stroke-primary" />
              </div>
            )}

            <div
              ref={bottomSentinelRef}
              style={{
                opacity:
                  !hasNextPage &&
                  conversationHistory &&
                  conversationHistory.length > 0
                    ? 1
                    : 0,
              }}
              className="text-center text-muted-foreground text-sm py-4"
            >
              已经到底了
            </div>
          </>
        )}
      </SidebarContent>
      <div className="relative mx-3 my-6">
        <Input
          value={seacherQueryKey}
          onChange={handleChangeSearchKey}
          placeholder="搜索..."
          className="p-5 pr-10 rounded-full"
        />
        <SearchIcon className="size-4 absolute right-4 top-1/2 -translate-y-1/2" />
      </div>
      <Separator />
      <SidebarFooter className="flex flex-row justify-between items-center p-6">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <Settings className="size-6" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="ml-2">
            {/* <DropdownMenuLabel>系统设置</DropdownMenuLabel>
            <DropdownMenuSeparator /> */}
            <DropdownMenuItem>
              <LogOut className="size-4" />
              退出登录
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <img
          className="rounded-full"
          src="/default-user.png"
          alt="avatar"
          width={40}
          height={40}
        />
      </SidebarFooter>
    </Sidebar>
  );
}
