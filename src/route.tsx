import { createRootRouteWithContext, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import authRouteTree from "./app/auth/route";
import chatRouteTree from "./app/chat/route";
import authenticatedRoute from "./app/_authenticated/route";
import type { UserCredentials } from "./apis/requests/user/schema";
import homeRouteTree from "./app/home/route";

// 定义认证状态接口
interface AuthState {
  isAuthenticated: boolean;
  user: UserCredentials | null;
}

// 定义路由上下文接口
interface MyRouterContext {
  auth: AuthState;
}

export const rootRoute = createRootRouteWithContext<MyRouterContext>()({
  component: () => (
    <>
      <Outlet />
      <TanStackRouterDevtools position="bottom-left" />
    </>
  ),
});

export const routeTree = rootRoute.addChildren([
  homeRouteTree,
  authRouteTree,
  authenticatedRoute.addChildren([chatRouteTree]),
]);
