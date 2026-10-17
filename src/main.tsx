
  import { createRoot } from "react-dom/client";
  import App from "./app/App.tsx";
  import "./styles/index.css";

  // "/" and "/normal" ship pre-rendered HTML for crawlers (scripts/prerender.mjs).
  // createRoot (not hydrateRoot) replaces it: the pages read window/sessionStorage
  // on first render, so a hydration pass would just mismatch.
  createRoot(document.getElementById("root")!).render(<App />);
  