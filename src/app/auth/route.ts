import { createRoute } from "@tanstack/react-router";
import AuthLayout from "./layouts/AuthLayout";
import LoginPage from "./LoginPage";
import {rootRoute} from "@/route";
import RegisterPage from "./RegisterPage";

// Auth routes
const authRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/auth',
  component: AuthLayout,
})

const loginRoute = createRoute({
  getParentRoute: () => authRoute,
  path: '/login',
  component: LoginPage,
})

const registerRoute = createRoute({
  getParentRoute: () => authRoute,
  path: '/register',
  component: RegisterPage,
})

const authRouteTree = authRoute.addChildren([loginRoute, registerRoute])

export default authRouteTree