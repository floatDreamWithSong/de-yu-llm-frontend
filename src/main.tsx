import { RouterProvider, createRouter } from "@tanstack/react-router";
import { StrictMode } from "react";
import ReactDOM from "react-dom/client";

import * as TanStackQueryProvider from "./integrations/tanstack-query/root-provider.tsx";

import "./styles.css";
import reportWebVitals from "./reportWebVitals.ts";
import { routeTree } from "./route.tsx";
import { Toaster } from "./components/ui/sonner.tsx";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

const TanStackQueryProviderContext = TanStackQueryProvider.getContext();
const router = createRouter({
  routeTree,
  context: {
    ...TanStackQueryProviderContext,
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
