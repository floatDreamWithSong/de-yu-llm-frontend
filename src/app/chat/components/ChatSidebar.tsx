import {
  Link,
  useLocation,
  useNavigate,
  useParams,
} from "@tanstack/react-router";
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
import { AnimatePresence, motion } from "motion/react";
import { Button, LinkButton } from "@/components/ui/button";
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
import ClientQueryKeys from "@/apis/queryKeys";
import { queryHistory } from "@/apis/requests/conversation/query";
import { deleteConversation } from "@/apis/requests/conversation/delete";
import { cn } from "@/lib/utils";
import { useInitMessageStore } from "@/store/initMessage";
import { tokenStore } from "@/lib/request";
import { Avatar } from "@/components/ui/avatar";

export default function ChatSidebar() {
  const {
    state,
    isMobile,
    setOpen,
    // openMobile, setOpenMobile
  } = useSidebar();
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
  const isExpanded = state === "expanded";
  const iconMode = !isExpanded && !isMobile;
  if (isMobile && !open) {
    console.log("open");
    setOpen(true);
  }

  const { conversationId: currentConversationId } = useParams({
    strict: false,
  });
  return (
    <Sidebar
      className={cn([
        "px-2 pb-0 pt-10 ease-out duration-400 style__shallow-shadow style__scroller",
        isMobile && "z-10",
      ])}
      variant="inset"
      collapsible={"icon"}
    >
      <SidebarHeader className="space-y-4">
        <div className="flex items-center px-2 gap-2">
          <div className="flex flex-row overflow-clip">
            <Avatar className="p-0.5 transition-transform cursor-pointer translate-x-1 ">
              <img
                src="/logo.svg"
                alt="logo"
                className=""
                onMouseUp={() => iconMode && setOpen(true)}
              />
            </Avatar>
            <AnimatePresence initial={false}>
              {!iconMode && (
                <motion.h2
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className={cn([
                    "text-primary font-semibold text-2xl ml-2 text-nowrap",
                    iconMode && "hidden",
                  ])}
                >
                  启创·<span className="text-xl">InnoSpark</span>
                </motion.h2>
              )}
            </AnimatePresence>
          </div>

          <SidebarTrigger
            className={cn([
              "self-end",
              iconMode ? "opacity-0 transition-none" : "delay-300",
            ])}
            icon={<img src="/collapse.svg" alt="collapse" />}
          />
        </div>
        <div className="px-3 space-y-4 flex flex-col my-6">
          <LinkButton
            to="/chat"
            className={cn([
              "rounded-full text-lg gap-0 overflow-clip",
              matchRouteId !== "chat" ? "bg-gray-100 text-[#545469]" : "",
            ])}
            size={iconMode ? "icon" : "lg"}
            variant={"secondary"}
          >
            <MessageCircleMoreIcon className="stroke-2 size-5" />
            {!iconMode && <span className={"ml-2"}>开始对话</span>}
          </LinkButton>

          <LinkButton
            to="/chat/agent"
            className={cn([
              "rounded-full text-lg overflow-clip gap-0",
              matchRouteId !== "agent" ? "bg-gray-100 text-[#545469]" : "",
            ])}
            size={iconMode ? "icon" : "lg"}
            variant={"secondary"}
          >
            <BotIcon className="stroke-2 size-5" />
            {!iconMode && <span className={"ml-2"}>智能助手</span>}
          </LinkButton>

          {/* <Button
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
            {!iconMode && <div className="mr-4">知识库</div>}
          </Button> */}
        </div>
      </SidebarHeader>
      <SidebarContent
        className={cn([
          " ease-out px-3",
          iconMode
            ? "opacity-0 -translate-x-full duration-0"
            : "open:opacity-100 delay-200 duration-400",
        ])}
        ref={scrollContainerRef}
      >
        {isLoading ? (
          <div className="w-full justify-center flex">
            <LoaderCircle className="animate-spin duration-500 stroke-primary" />
          </div>
        ) : (
          <div>
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
                          <SidebarMenuButton
                            isActive={
                              currentConversationId === item.conversationId
                            }
                            asChild
                          >
                            <Link
                              onClick={reset}
                              to={`/chat/$conversationId`}
                              search={{
                                botId:
                                  item.botId.length === 0 ? void 0 : item.botId,
                              }}
                              params={{
                                conversationId: item.conversationId,
                              }}
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
          </div>
        )}
      </SidebarContent>
      <div
        className={cn([
          "relative mx-3 my-6",
          iconMode
            ? "opacity-0 -translate-x-full duration-0"
            : "open:opacity-100 delay-200 duration-400",
          " ease-out",
        ])}
      >
        <Input
          value={seacherQueryKey}
          onChange={handleChangeSearchKey}
          placeholder="搜索..."
          className="p-5 pr-10 rounded-full"
        />
        <SearchIcon className="size-4 absolute right-4 top-1/2 -translate-y-1/2" />
      </div>
      <Separator />
      <SidebarFooter
        className={cn([
          "flex justify-between items-center p-6 flex-row",
          iconMode && "flex-col-reverse",
        ])}
      >
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <Settings className="size-6" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="ml-2">
            {/* <DropdownMenuLabel>系统设置</DropdownMenuLabel>
            <DropdownMenuSeparator /> */}
            <Link
              to="/auth/login"
              search={{ redirect: "/chat" }}
              preload="render"
              onClick={() => tokenStore.remove()}
            >
              <DropdownMenuItem>
                <LogOut className="size-4" />
                退出登录
              </DropdownMenuItem>
            </Link>
          </DropdownMenuContent>
        </DropdownMenu>
        <Avatar>
          <img src="/default-user.png" alt="avatar" />
        </Avatar>
      </SidebarFooter>
    </Sidebar>
  );
}
