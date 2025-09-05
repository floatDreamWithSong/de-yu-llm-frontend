import { createRootRoute, Outlet, createRoute } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import authRouteTree from "./app/auth/route";
import chatRouteTree from "./app/chat/route";

export const rootRoute = createRootRoute({
  component: () => (
    <>
      <Outlet />
      <TanStackRouterDevtools />
    </>
  ),
})

// Root redirect
const indexRoute = createRoute({
	getParentRoute: () => rootRoute,
	path: "/",
	component: () => {
		window.location.href = "/chat";
		return null;
	},
});

export const routeTree = rootRoute.addChildren([
	indexRoute,
	authRouteTree,
	chatRouteTree,
]);
