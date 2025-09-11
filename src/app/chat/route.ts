import { rootRoute } from "@/route";
import { createRoute } from "@tanstack/react-router";
import { lazy } from "react";
const ChatPage = lazy(()=>import("./ChatPage"))
const ChatLayout = lazy(()=>import("./layouts/ChatLayout"))
const ConversationPage = lazy(()=>import("./ConversationPage"));

const chatRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/chat",
  component: ChatLayout,
});

const chatIndexRoute = createRoute({
  getParentRoute: () => chatRoute,
  path: "/",
  component: ChatPage,
});

const conversationRoute = createRoute({
  getParentRoute: () => chatRoute,
  path: "/$conversationId",
  component: ConversationPage,
});

const chatRouteTree = chatRoute.addChildren([
  chatIndexRoute,
  conversationRoute,
]);

export default chatRouteTree;
