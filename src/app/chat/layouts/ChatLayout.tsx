"use client";

import ChatSidebar from "@/app/chat/components/ChatSidebar";
import {
  SidebarProvider,
} from "@/components/ui/sidebar";

import { Outlet } from "@tanstack/react-router";

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
      <main className=" w-full h-full bg-chat">
        <Outlet />
      </main>
    </SidebarProvider>
  );
}
