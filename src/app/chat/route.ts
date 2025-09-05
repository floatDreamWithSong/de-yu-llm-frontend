import { rootRoute } from "@/route";
import { createRoute } from "@tanstack/react-router";
import ChatPage from "./ChatPage";
import ConversationPage from "./ConversationPage";
import ChatLayout from "./layouts/ChatLayout";

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
