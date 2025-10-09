import { rootRoute } from "@/route";
import { createRoute, lazyRouteComponent } from "@tanstack/react-router";

const homeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/home",
  component: lazyRouteComponent(() => import("./layout/HomeLayout.tsx")),
});

const homepage = createRoute({
  getParentRoute: () => homeRoute,
  path: "/",
  component: lazyRouteComponent(() => import("./HomePage.tsx")),
});

const homeRouteTree = homeRoute.addChildren([homepage]);

export default homeRouteTree;
