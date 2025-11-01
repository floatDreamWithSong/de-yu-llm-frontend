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

scan({
  enabled: false,
});

const TanStackQueryProviderContext = TanStackQueryProvider.getContext();

const router = createRouter({
  routeTree,
  context: {
    ...TanStackQueryProviderContext,
    // 认证状态现在在 beforeLoad 中实时检查，这里提供一个基础结构
    auth: {
      isAuthenticated: false,
      user: null,
    },
  },
  defaultPreload: "render",
  scrollRestoration: true,
  defaultStructuralSharing: true,
  defaultViewTransition: true,
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
        <Toaster position={"top-center"} />
        <ReactQueryDevtools />
      </TanStackQueryProvider.Provider>
    </StrictMode>,
  );
}

reportWebVitals();
