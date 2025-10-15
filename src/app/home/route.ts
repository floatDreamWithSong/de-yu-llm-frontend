import { rootRoute } from "@/route";
import { createRoute } from "@tanstack/react-router";
import HomePage from "./HomePage.tsx";
import HomeLayout from "./layout/HomeLayout.tsx";

const homeRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: "_home",
  component: HomeLayout,
});

const homepage = createRoute({
  getParentRoute: () => homeRoute,
  path: "/",
  component: HomePage,
});

const homeRouteTree = homeRoute.addChildren([homepage]);

export default homeRouteTree;
