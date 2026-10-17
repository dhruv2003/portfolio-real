// Pre-renders the public pages into static HTML so crawlers and link previews
// see real content and per-page meta tags without running JS.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dist = path.join(root, "dist");
const ssrDir = path.join(root, "dist-ssr");
const SITE = "https://thisisdhruv.in";

const pages = [
  {
    url: "/",
    out: "index.html",
    title: "Dhruv Bhagatkar | Backend + Infrastructure Engineer",
    description:
      "Portfolio of Dhruv Bhagatkar, a backend and DevOps engineer at Oracle Financial Services Software. Systems, observability, authentication, and production glue.",
  },
  {
    url: "/normal",
    out: "normal/index.html",
    title: "Dhruv Bhagatkar | Backend & DevOps Engineer — Resume",
    description:
      "Resume of Dhruv Bhagatkar, Associate Consultant at Oracle Financial Services Software. Backend and DevOps engineer: SSO/SAML authentication, Kubernetes, Jenkins, WebLogic, FCUBS.",
  },
];

const escapeAttr = (s) => s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");

function replaceOnce(html, pattern, replacement, label) {
  if (!pattern.test(html)) throw new Error(`prerender: could not find ${label} in index.html`);
  return html.replace(pattern, replacement);
}

const serverEntry = fs
  .readdirSync(ssrDir)
  .find((f) => /^entry-server\.(m?js)$/.test(f));
if (!serverEntry) throw new Error("prerender: SSR bundle not found in dist-ssr/");
const { render } = await import(pathToFileURL(path.join(ssrDir, serverEntry)).href);

const shell = fs.readFileSync(path.join(dist, "index.html"), "utf8");

// Unprerendered shell for /chat, /terminal and unknown paths (see vercel.json),
// so they don't flash the homepage markup before the app boots.
fs.writeFileSync(path.join(dist, "spa.html"), shell);

for (const page of pages) {
  const appHtml = await render(page.url);
  const canonical = `${SITE}${page.url === "/" ? "" : page.url}`;
  let html = shell;
  html = replaceOnce(html, /<title>[^<]*<\/title>/, `<title>${escapeAttr(page.title)}</title>`, "<title>");
  html = replaceOnce(html, /<meta name="description" content="[^"]*" \/>/, `<meta name="description" content="${escapeAttr(page.description)}" />`, "meta description");
  html = replaceOnce(html, /<link rel="canonical" href="[^"]*" \/>/, `<link rel="canonical" href="${canonical}" />`, "canonical");
  html = replaceOnce(html, /<meta property="og:url" content="[^"]*" \/>/, `<meta property="og:url" content="${canonical}" />`, "og:url");
  html = replaceOnce(html, /<div id="root"><\/div>/, `<div id="root">${appHtml}</div>`, "#root");

  const outFile = path.join(dist, page.out);
  fs.mkdirSync(path.dirname(outFile), { recursive: true });
  fs.writeFileSync(outFile, html);
  console.log(`prerendered ${page.url} -> dist/${page.out} (${(appHtml.length / 1024).toFixed(1)} KiB)`);
}

fs.rmSync(ssrDir, { recursive: true, force: true });
