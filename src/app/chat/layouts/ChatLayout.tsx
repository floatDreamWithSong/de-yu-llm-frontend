"use client";

import ChatSidebar from "@/app/chat/components/ChatSidebar";
import {
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { useIsMobile } from "@/hooks/use-mobile";
import { useGSAP } from "@gsap/react";
import { Outlet, useRouter } from "@tanstack/react-router";
import gsap from "gsap";
import { ChevronsRightIcon } from "lucide-react";
import { useRef } from "react";

const sidebarWidth = "380px";

export default function ChatLayout() {
  const router = useRouter();
  return (
    <div
      style={{ backgroundImage: "url(/chat/bg.png)" }}
      className="w-full h-full bg-cover bg-center bg-no-repeat"
    >
      <SidebarProvider
        style={
          {
            "--sidebar-width": sidebarWidth,
            "--sidebar-width-mobile": sidebarWidth,
            background: "transparent",
          } as React.CSSProperties
        }
      >
        <ChatSidebar className="px-10 py-20 ease-out duration-400" />
        <main className="w-full flex-1 flex flex-col py-20 ml-6">
          <SidebarExpandTrigger />
          {router.state.location.pathname !== "/chat" && (
            <div className="z-50 safe-area-top min-h-10 flex items-center sticky top-0 w-full">
              <div id="sidebar-header" />
            </div>
          )}
          <Outlet />
        </main>
      </SidebarProvider>
    </div>
  );
}

function SidebarExpandTrigger() {
  const triggerRef = useRef<HTMLButtonElement>(null);
  const { state } = useSidebar();
  const isMobile = useIsMobile();
  useGSAP(() => {
    if (state === "collapsed") {
      gsap.set(triggerRef.current, {
        x: -200,
        opacity: 0,
      });
      gsap.to(triggerRef.current, {
        x: 0,
        duration: 0.6,
        ease: "power3.in",
      });
      gsap.to(triggerRef.current, {
        opacity: 1,
        duration: 0.3,
        ease: "power3.in",
        delay: 0.3,
      });
    }
  }, [state]);
  return (
    (state === "collapsed" || isMobile) && (
      <SidebarTrigger
        icon={<ChevronsRightIcon className="size-6 stroke-primary" />}
        ref={triggerRef}
        className="bg-white rounded-r-full size-8 absolute top-1/2 -translate-y-1/2 opacity-0 -ml-6"
      />
    )
  );
}
