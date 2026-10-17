// Build-time only: renders a route to static HTML for scripts/prerender.mjs.
import { renderToString } from "react-dom/server";
import {
  createStaticHandler,
  createStaticRouter,
  StaticRouterProvider,
} from "react-router";
import { routes } from "./app/routeConfig";

export async function render(url: string) {
  const handler = createStaticHandler(routes);
  const context = await handler.query(new Request(`https://thisisdhruv.in${url}`));
  if (context instanceof Response) throw new Error(`Unexpected response for ${url}`);
  const router = createStaticRouter(handler.dataRoutes, context);
  return renderToString(
    <StaticRouterProvider router={router} context={context} hydrate={false} />
  );
}
