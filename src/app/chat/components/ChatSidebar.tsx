import { Link, useNavigate } from "@tanstack/react-router";
import {
  BotIcon,
  Edit,
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
import { useState } from "react";

export default function ChatSidebar() {
  const { state } = useSidebar();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [renamingItemId, setRenamingItemId] = useState("");
  const [tempTitle, setTempTitle] = useState("");
  const { data: conversationHistory } = useInfiniteQuery({
    queryKey: ["conversationHistory"],
    queryFn: ({ pageParam = 1 }) =>
      getConversationHistoryList({
        page: { page: pageParam, size: 20 },
      }),
    getNextPageParam: (lastPage, pages) =>
      lastPage.conversations.length > 0 ? pages.length + 1 : undefined,
    initialPageParam: 1,
    select: (data) => data.pages.flatMap((page) => page.conversations),
  });
  const renameMutation = useMutation({
    mutationFn: renameConversation,
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: ["conversationHistory"] });
      type Page = { conversations: Conversation[] };
      type Data = InfiniteData<Page, number>;
      const previousData = queryClient.getQueryData<Data>([
        "conversationHistory",
      ]);
      // 更新底层无限列表的 pages 结构
      queryClient.setQueryData<Data>(["conversationHistory"], (oldData) => {
        if (!oldData) return oldData as Data | undefined;
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
      });
      return { previousData };
    },
    onError: (_err, _variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(["conversationHistory"], context.previousData);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["conversationHistory"] });
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
  return (
    <Sidebar
      className="px-2 pb-0 pt-10 ease-out duration-400 style__shallow-shadow"
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
            className="rounded-full text-lg "
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
            className="rounded-full text-lg "
            size={"lg"}
            variant={"secondary"}
            onClick={() => {
              navigate({ to: "/chat" });
            }}
          >
            <BotIcon className="stroke-2 size-5" />
            智能助手
          </Button>
          <Button
            className="rounded-full text-lg "
            size={"lg"}
            variant={"secondary"}
            onClick={() => {
              navigate({ to: "/chat" });
            }}
          >
            <MessageCircleMoreIcon className="stroke-2 size-5" />
            知识库
          </Button>
        </div>
      </SidebarHeader>
      <SidebarContent className="px-3">
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
                          <DropdownMenuItem variant="destructive">
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
      </SidebarContent>
      <div className="relative mx-3 my-6">
        <Input placeholder="搜索..." className="p-5 pr-10 rounded-full" />
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
