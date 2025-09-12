import { rootRoute } from "@/route";
import { createRoute, lazyRouteComponent } from "@tanstack/react-router";
import { lazy } from "react";
const ChatPage = lazy(() => import("./ChatPage"));
const ChatLayout = lazy(() => import("./layouts/ChatLayout"));
const ConversationPage = lazy(() => import("./ConversationPage"));

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

const agenrRoute = createRoute({
  path: "/agent",
  getParentRoute: () => chatRoute,
  component: lazyRouteComponent(() => import("./agent/AgentPage")),
});

const databaseRoute = createRoute({
  path: "/database",
  getParentRoute: () => chatRoute,
  component: lazyRouteComponent(() => import("./database/DatabasePage")),
});

const chatRouteTree = chatRoute.addChildren([
  chatIndexRoute,
  conversationRoute,
  agenrRoute,
  databaseRoute
]);

export default chatRouteTree;
