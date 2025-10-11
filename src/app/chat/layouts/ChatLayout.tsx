"use client";

import ChatSidebar from "@/app/chat/components/ChatSidebar";
import {
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";

import { Outlet } from "@tanstack/react-router";
import "../styles/chat.scss";
import type React from "react";

const sidebarWidth = "300px";

export default function ChatLayout() {
  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": sidebarWidth,
          "--sidebar-width-mobile": sidebarWidth,
        } as React.CSSProperties
      }
    >
      <ChatSidebar />
      <div className=" w-full h-full bg-chat relative">
        <MobileNav />
        <Main>
          <Outlet />
        </Main>
      </div>
    </SidebarProvider>
  );
}
const Main = ({ ...props }: React.ComponentProps<"main">) => {
  const { isMobile } = useSidebar();
  return (
    <main
      className="w-full bg-chat relative h-full"
      id={isMobile ? "chat-main" : ""}
      {...props}
    />
  );
};
const MobileNav = () => {
  const { isMobile } = useSidebar();
  if (!isMobile) return null;
  return (
    <div className="sticky bg-chat h-12 z-10 top-0 flex items-center">
      <SidebarTrigger className="size-10" iconClassName="size-5" />
    </div>
  );
};
