import { useEffect } from "react";

const SITE = "https://thisisdhruv.in";

function setMeta(selector: string, create: () => HTMLElement, attr: string, value: string) {
  let el = document.head.querySelector<HTMLElement>(selector);
  if (!el) {
    el = create();
    document.head.appendChild(el);
  }
  el.setAttribute(attr, value);
}

/** Per-route title, description, canonical and robots directives. */
export function usePageMeta({
  title,
  description,
  path,
  noindex = false,
}: {
  title: string;
  description?: string;
  path: string;
  noindex?: boolean;
}) {
  useEffect(() => {
    document.title = title;

    if (description) {
      setMeta('meta[name="description"]', () => {
        const m = document.createElement("meta");
        m.name = "description";
        return m;
      }, "content", description);
    }

    setMeta('link[rel="canonical"]', () => {
      const l = document.createElement("link");
      l.rel = "canonical";
      return l;
    }, "href", `${SITE}${path === "/" ? "" : path}`);

    setMeta('meta[name="robots"]', () => {
      const m = document.createElement("meta");
      m.name = "robots";
      return m;
    }, "content", noindex ? "noindex, nofollow" : "index, follow");
  }, [title, description, path, noindex]);
}
