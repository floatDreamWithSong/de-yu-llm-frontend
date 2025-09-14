import { createRoute, redirect, Outlet } from "@tanstack/react-router";
import { rootRoute } from "@/route";

// 创建认证布局路由
export const authenticatedRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: "_authenticated",
  beforeLoad: ({ context, location }) => {
    // 检查用户是否已认证
    if (!context.auth.isAuthenticated) {
      // 如果未认证，重定向到登录页面，并保存当前路径用于登录后跳转
      throw redirect({
        to: "/auth/login",
        search: {
          redirect: location.href,
        },
      });
    }
  },
  component: () => <Outlet />,
});

export default authenticatedRoute;
