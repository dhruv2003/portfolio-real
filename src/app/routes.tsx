import { createBrowserRouter } from "react-router";
import { Home } from "./routes/Home";
import { ChatFullPage } from "./routes/ChatFullPage";
import { NormalPortfolio } from "./routes/NormalPortfolio";
import { NotFound } from "./routes/NotFound";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Home,
  },
  {
    path: "/chat",
    Component: ChatFullPage,
  },
  {
    path: "/normal",
    Component: NormalPortfolio,
  },
  {
    path: "*",
    Component: NotFound,
  },
]);