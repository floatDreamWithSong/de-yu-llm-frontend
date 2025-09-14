import { RouterProvider, createRouter } from "@tanstack/react-router";
import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import { scan } from "react-scan";
import * as TanStackQueryProvider from "./integrations/tanstack-query/root-provider.tsx";

import "./styles.css";
import reportWebVitals from "./reportWebVitals.ts";
import { routeTree } from "./route.tsx";
import { Toaster } from "./components/ui/sonner.tsx";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { userInfoStore } from "./store/user";

scan({
  enabled: false,
});

const TanStackQueryProviderContext = TanStackQueryProvider.getContext();

// 创建认证上下文
const createAuthContext = () => {
  const user = userInfoStore.getState();
  const isAuthenticated = Boolean(user.token && user.expire > 0 && user.expire * 1000 > Date.now());
  
  return {
    auth: {
      isAuthenticated,
      user: isAuthenticated ? user : null,
    },
  };
};

const router = createRouter({
  routeTree,
  context: {
    ...TanStackQueryProviderContext,
    ...createAuthContext(),
  },
  defaultPreload: "intent",
  scrollRestoration: true,
  defaultStructuralSharing: true,
  defaultPreloadStaleTime: 0,
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

const rootElement = document.getElementById("app");
if (rootElement && !rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <StrictMode>
      <TanStackQueryProvider.Provider {...TanStackQueryProviderContext}>
        <RouterProvider router={router} />
        <Toaster />
        <ReactQueryDevtools />
      </TanStackQueryProvider.Provider>
    </StrictMode>,
  );
}

reportWebVitals();
