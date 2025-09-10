import { Link, useNavigate } from "@tanstack/react-router";
import {
  BotIcon,
  LogOut,
  MessageCircleMoreIcon,
  SearchIcon,
  Settings,
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
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { getConversationHistoryList } from "@/apis/requests/conversation/history";
import { useInfiniteQuery } from "@tanstack/react-query";
import groupConversationsByDate from "@/utils/date-group";

export default function ChatSidebar() {
  const { state } = useSidebar();
  const navigate = useNavigate();
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
                    <SidebarMenuButton>
                      <Link
                        to={`/chat/$conversationId`}
                        params={{ conversationId: item.conversationId }}
                      >
                        <span>{item.brief}</span>
                      </Link>
                    </SidebarMenuButton>
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
