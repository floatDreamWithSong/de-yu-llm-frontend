import { createRoute, lazyRouteComponent } from "@tanstack/react-router";
import { rootRoute } from "@/route";
import SetNewUserPasswordPage from "./SetNewUserPasswordPage";
const AuthLayout = lazyRouteComponent(() => import("./layouts/AuthLayout"));
const LoginPage = lazyRouteComponent(() => import("./LoginPage"));
const PhonePasswordLoginPage = lazyRouteComponent(
  () => import("./PhonePasswordLoginPage"),
);

// Auth routes
const authRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/auth",
  component: AuthLayout,
});

const loginRoute = createRoute({
  getParentRoute: () => authRoute,
  path: "/login",
  validateSearch: (search) => ({
    redirect: (search.redirect as string) || "/chat",
  }),
  component: LoginPage,
});

const phonePasswordLoginRoute = createRoute({
  getParentRoute: () => authRoute,
  path: "/login/password",
  validateSearch: (search) => ({
    redirect: (search.redirect as string) || "/chat",
  }),
  component: PhonePasswordLoginPage,
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
]);

export default authRouteTree;
