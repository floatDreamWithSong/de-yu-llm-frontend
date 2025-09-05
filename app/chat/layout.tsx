"use client";

import {
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import ChatSidebar from "./sidebar";

const sidebarWidth = "300px";

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
        {children}
      </main>
    </SidebarProvider>
  );
}

function SidebarExpandTrigger() {
  const { state } = useSidebar();
  return state === "collapsed" && <SidebarTrigger iconClassName="size-6" />;
}
