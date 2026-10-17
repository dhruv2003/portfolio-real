import type { RouteObject } from "react-router";
import { Home } from "./routes/Home";
import { NormalPortfolio } from "./routes/NormalPortfolio";
import { NotFound } from "./routes/NotFound";

// "/" and "/normal" stay in the main bundle: they are pre-rendered and must paint
// immediately. Chat and the CLI resume are split out and fetched on demand.
export const routes: RouteObject[] = [
  {
    path: "/",
    Component: Home,
  },
  {
    path: "/chat",
    lazy: () => import("./routes/ChatFullPage").then((m) => ({ Component: m.ChatFullPage })),
  },
  {
    path: "/normal",
    Component: NormalPortfolio,
  },
  {
    path: "/terminal",
    lazy: () => import("./routes/TerminalResume").then((m) => ({ Component: m.TerminalResume })),
  },
  {
    path: "*",
    Component: NotFound,
  },
];
