import { useNavigate } from "@tanstack/react-router";
import {
  BookOpen,
  ListCollapseIcon,
  MessageCircleMoreIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

// Menu items.
const items = [
  {
    title: "你能做什么",
    url: "#",
  },
  {
    title: "孩子说两嘴顶嘴，一发凶就哭怎么办",
    url: "#",
  },
  {
    title: "随便问点",
    url: "#",
  },
  {
    title: "孩子说两嘴顶嘴，一发凶就哭怎么办 孩子说两嘴顶嘴，一发凶就哭怎么办",
    url: "#",
  },
  {
    title: "Settingasdasdadss",
    url: "#",
  },
  {
    title: "你能做什么",
    url: "#",
  },
  {
    title: "孩子说两嘴顶嘴，一发凶就哭怎么办",
    url: "#",
  },
  {
    title: "随便问点",
    url: "#",
  },
  {
    title: "孩子说两嘴顶嘴，一发凶就哭怎么办 孩子说两嘴顶嘴，一发凶就哭怎么办",
    url: "#",
  },
  {
    title: "Settingasdasdadss",
    url: "#",
  },
  {
    title: "你能做什么",
    url: "#",
  },
  {
    title: "孩子说两嘴顶嘴，一发凶就哭怎么办",
    url: "#",
  },
  {
    title: "随便问点",
    url: "#",
  },
  {
    title: "孩子说两嘴顶嘴，一发凶就哭怎么办 孩子说两嘴顶嘴，一发凶就哭怎么办",
    url: "#",
  },
  {
    title: "Settingasdasdadss",
    url: "#",
  },
  {
    title: "你能做什么",
    url: "#",
  },
  {
    title: "孩子说两嘴顶嘴，一发凶就哭怎么办",
    url: "#",
  },
  {
    title: "随便问点",
    url: "#",
  },
  {
    title: "孩子说两嘴顶嘴，一发凶就哭怎么办 孩子说两嘴顶嘴，一发凶就哭怎么办",
    url: "#",
  },
  {
    title: "Settingasdasdadss",
    url: "#",
  },
];

export default function ChatSidebar({ className }: { className?: string }) {
  const { state } = useSidebar();
  const navigate = useNavigate();
  return (
    <Sidebar variant="inset" className={className}>
      <SidebarHeader className="space-y-4 px-8 pt-10 relative">
        <div className="flex items-center justify-between gap-2">
          <h2
            className="text-primary text-xl font-bold"
            style={{ letterSpacing: "0.06em" }}
          >
            张江高科&nbsp;·&nbsp;高科芯
          </h2>
          {state === "expanded" && (
            <SidebarTrigger
              icon={<ListCollapseIcon className="size-6 stroke-primary" />}
            />
          )}
        </div>
        <Button
          className="rounded-full text-lg font-bold"
          size={"lg"}
          onClick={() => {
            navigate({ to: "/chat" });
          }}
        >
          <MessageCircleMoreIcon className="stroke-2 size-5" />
          开始对话
        </Button>
        <Button
          className="rounded-full text-lg text-primary border-2 border-primary font-bold outline-0 hover:text-primary"
          size={"lg"}
          variant={"outline"}
          onClick={() => {
            navigate({ to: "/chat" });
          }}
        >
          <BookOpen className="stroke-2 size-5 text-primary" />
          知识宝库
        </Button>
        <img
          src="/chat/bot.png"
          alt="bot"
          className="absolute left-2 h-[5.6rem] top-0 -translate-y-7/12"
        />
      </SidebarHeader>
      <SidebarContent className="mt-10 px-3 ">
        <SidebarGroup>
          <SidebarGroupLabel className="text-md font-bold text-[#9d9da9]">
            昨天
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item, index) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
                <SidebarMenuItem key={item.title + index}>
                  <SidebarMenuButton asChild>
                    <a href={item.url}>
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-4">
        <div className="relative">
          <Input
            placeholder="搜索......"
            className=" p-5 pr-13 mr-10 rounded-full rounded-r-none border-2 border-primary"
          />
          <img
            loading="eager"
            src="/chat/search.png"
            alt="search"
            className="size-12 absolute right-0 top-1/2 -translate-y-1/2"
          />
        </div>
      </SidebarFooter>
      {/* <Separator />
      <SidebarFooter className="flex flex-row justify-between items-center p-6">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <Settings className="size-6" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="ml-2">
            <DropdownMenuLabel>系统设置</DropdownMenuLabel>
            <DropdownMenuSeparator />
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
      </SidebarFooter> */}
    </Sidebar>
  );
}
