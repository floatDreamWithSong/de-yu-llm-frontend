import { createRoute } from "@tanstack/react-router";
import { rootRoute } from "@/route";
import { lazy } from "react";
import SetNewUserPasswordPage from "./SetNewUserPasswordPage";
const AuthLayout = lazy(() => import("./layouts/AuthLayout"));
const LoginPage = lazy(() => import("./LoginPage"));
const PhonePasswordLoginPage = lazy(() => import("./PhonePasswordLoginPage"));

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

const authRouteTree = authRoute.addChildren([loginRoute, phonePasswordLoginRoute, setNewUserPasswordRoute]);

export default authRouteTree;
