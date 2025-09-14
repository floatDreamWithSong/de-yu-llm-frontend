import { createRoute, redirect, Outlet } from "@tanstack/react-router";
import { rootRoute } from "@/route";
import { userInfoStore } from "@/store/user";

// 创建认证布局路由
export const authenticatedRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: "_authenticated",
  beforeLoad: ({ location }) => {
    // 实时检查用户认证状态
    const user = userInfoStore.getState();
    const isAuthenticated = Boolean(user.token && user.expire > 0 && user.expire * 1000 > Date.now());
    
    if (!isAuthenticated) {
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
