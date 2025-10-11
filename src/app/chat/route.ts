import { createRoute, lazyRouteComponent } from "@tanstack/react-router";
import authenticatedRoute from "../_authenticated/route";

const ChatLayout = lazyRouteComponent(() => import('./layouts/ChatLayout'))
const ChatPage = lazyRouteComponent(() => import('./ChatPage'))
const ConversationPage = lazyRouteComponent(() => import('./ConversationPage'))
const validateSearch = (search: {
  think?: boolean;
  botId?: string;
  webSearch?: boolean;
}) => search;

const chatRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: "/chat",
  component: ChatLayout,
});

const chatIndexRoute = createRoute({
  getParentRoute: () => chatRoute,
  path: "/",
  validateSearch,
  component: ChatPage,
});

const conversationRoute = createRoute({
  getParentRoute: () => chatRoute,
  path: "/$conversationId",
  validateSearch,
  component: ConversationPage,
});

const agenrRoute = createRoute({
  path: "/agent",
  validateSearch: (search: { page?: number; size?: number, botType?: string }) => search,
  getParentRoute: () => chatRoute,
  component: lazyRouteComponent(() => import("./agent/AgentPage")),
});

const agentChatRoute = createRoute({
  getParentRoute: () => chatRoute,
  path: "/agent/chat/$agentId",
  component: lazyRouteComponent(() => import("./agent/AgentChatPage")),
  validateSearch,
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
  databaseRoute,
  agentChatRoute,
]);

export default chatRouteTree;
