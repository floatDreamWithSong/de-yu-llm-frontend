"use client";

import ChatSidebar from "@/app/chat/components/ChatSidebar";
import { SidebarProvider, SidebarTrigger, useSidebar } from "@/components/ui/sidebar";

import { Outlet } from "@tanstack/react-router";
import '../styles/chat.scss'

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
        <main className=" w-full bg-chat relative" id="chat-main" >
          <Outlet />
        </main>
      </div>
    </SidebarProvider>
  );
}

const MobileNav = () => {
  const { isMobile } = useSidebar();
  if (!isMobile) return null;
  return <div className="sticky bg-chat h-12 z-10 top-0 flex items-center">
    <SidebarTrigger className="size-10" iconClassName="size-5" />
  </div>;
};
