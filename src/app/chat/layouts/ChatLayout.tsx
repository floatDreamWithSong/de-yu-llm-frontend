"use client";

import ChatSidebar from "@/app/chat/components/ChatSidebar";
import {
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { Outlet } from '@tanstack/react-router';

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
      <main className=" w-full h-full mx-2">
        <div className="safe-area-top min-h-10 flex items-center sticky top-0 w-full">
          <SidebarExpandTrigger />
          <div id="sidebar-header" />
        </div>
        <Outlet />
      </main>
    </SidebarProvider>
  );
}

function SidebarExpandTrigger() {
  const { state } = useSidebar();
  return state === "collapsed" && <SidebarTrigger iconClassName="size-6" />;
}
