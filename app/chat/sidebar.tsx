import {
  Calendar,
  Home,
  Inbox,
  ListCollapseIcon,
  MessageCircleMoreIcon,
  Search,
  SearchIcon,
  Settings,
} from "lucide-react";

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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import Image from "next/image";

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
    title: "Settings",
    url: "#",
  },
];

export default function ChatSidebar() {
  const { state } = useSidebar()
  return (
    <Sidebar className="px-5 pb-0 pt-10 ease-out duration-400" variant="inset">
      <SidebarHeader className="space-y-4">
        <div className="flex items-center justify-center gap-2">
          <h2 className="text-primary font-semibold text-[1.45rem]">
            张江高科·高科芯
          </h2>
          {state === "expanded" && <SidebarTrigger icon={<ListCollapseIcon className="size-6" />} />}
        </div>
        <Button
          className="rounded-full text-lg "
          size={"lg"}
          variant={"secondary"}
        >
          <MessageCircleMoreIcon className="stroke-2 size-5" />
          开始对话
        </Button>
        <div className="relative">
          <Input placeholder="搜索..." className="p-5 mr-10 rounded-full" />
          <SearchIcon className="size-4 absolute right-4 top-1/2 -translate-y-1/2" />
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-md font-bold text-[#9d9da9]">
            昨天
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
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
      <Separator />
      <SidebarFooter className="flex flex-row justify-between items-center p-6">
          <Button variant="ghost" size="icon">
              <Settings className="size-6" />
          </Button>
          <Image className="rounded-full" src="/default-user.png" alt="avatar" width={40} height={40} />
      </SidebarFooter>
    </Sidebar>
  );
}
