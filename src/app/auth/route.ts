import { createRoute, lazyRouteComponent } from "@tanstack/react-router";
import { rootRoute } from "@/route";
import SetNewUserPasswordPage from "./SetNewUserPasswordPage";
// Auth routes
const authRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/auth",
  component: lazyRouteComponent(() => import("./layouts/AuthLayout")),
});

const thridPartyLoginRoute = createRoute({
  getParentRoute: () => authRoute,
  path: "/thirdparty-login",
  component: lazyRouteComponent(() => import("./ThirdPartyLoginPage")),
  validateSearch: (search: { ticket?: string; thirdparty?: string }) => {
    return {
      ticket: search.ticket,
      thirdparty: search.thirdparty,
    };
  },
});

const loginRoute = createRoute({
  getParentRoute: () => authRoute,
  path: "/login",
  validateSearch: (search) => ({
    redirect: (search.redirect as string) || "/chat",
  }),
  component: lazyRouteComponent(() => import("./LoginPage")),
});

const phonePasswordLoginRoute = createRoute({
  getParentRoute: () => authRoute,
  path: "/login/password",
  validateSearch: (search) => ({
    redirect: (search.redirect as string) || "/chat",
  }),
  component: lazyRouteComponent(() => import("./PhonePasswordLoginPage")),
});

const setNewUserPasswordRoute = createRoute({
  getParentRoute: () => authRoute,
  path: "/login/password/set",
  validateSearch: (search) => ({
    redirect: (search.redirect as string) || "/chat",
  }),
  component: SetNewUserPasswordPage,
});

const authRouteTree = authRoute.addChildren([
  loginRoute,
  phonePasswordLoginRoute,
  setNewUserPasswordRoute,
  thridPartyLoginRoute,
]);

export default authRouteTree;
