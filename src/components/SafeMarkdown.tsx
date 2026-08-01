import ReactMarkdown from 'react-markdown';
import type { Components } from 'react-markdown';

const ALLOWED_PROTOCOLS = /^(https?:|mailto:)/i;

function safeHref(href: string | undefined): string | undefined {
  if (!href) return undefined;
  const trimmed = href.trim();
  if (ALLOWED_PROTOCOLS.test(trimmed)) return trimmed;
  return undefined;
}

const components: Components = {
  p: ({ children }) => <p className="mb-4 last:mb-0">{children}</p>,
  ul: ({ children }) => (
    <ul className="list-none space-y-3 mb-4 last:mb-0 pl-1">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="list-decimal space-y-2 mb-4 last:mb-0 pl-6">{children}</ol>
  ),
  // Unordered lists keep neo-brutalist ▹ markers; ordered lists keep native decimals.
  li: ({ children }) => (
    <li className="flex gap-3 items-start in-[ol]:list-item in-[ol]:block">
      <span
        className="text-[#FF90E8] mt-1.5 shrink-0 font-black in-[ol]:hidden"
        aria-hidden
      >
        ▹
      </span>
      <span className="flex-1 in-[ol]:inline">{children}</span>
    </li>
  ),
  strong: ({ children }) => (
    <strong className="font-black bg-[#FFC900]/50 border-b-2 border-black px-1">
      {children}
    </strong>
  ),
  pre: ({ children }) => (
    <pre className="bg-neutral-100 border-2 border-black p-3 mb-4 overflow-x-auto text-sm font-mono">
      {children}
    </pre>
  ),
  code: ({ children }) => (
    <code className="bg-neutral-100 border border-black px-1 text-sm font-mono">
      {children}
    </code>
  ),
  a: ({ href, children }) => {
    const safe = safeHref(href);
    if (!safe) return <span>{children}</span>;
    return (
      <a
        href={safe}
        target="_blank"
        rel="noopener noreferrer nofollow"
        className="underline decoration-2 underline-offset-2"
      >
        {children}
      </a>
    );
  },
  h1: ({ children }) => <p className="font-black text-xl mb-2">{children}</p>,
  h2: ({ children }) => <p className="font-black text-lg mb-2">{children}</p>,
  h3: ({ children }) => <p className="font-black mb-2">{children}</p>,
};

interface SafeMarkdownProps {
  children: string;
}

/**
 * Model markdown with a tight element set and https/http/mailto links only.
 * Raw HTML stays off (no rehype-raw).
 */
export function SafeMarkdown({ children }: SafeMarkdownProps) {
  const text = children.length > 12000 ? `${children.slice(0, 12000)}…` : children;
  return (
    <ReactMarkdown
      urlTransform={(url) => safeHref(url) || ''}
      components={components}
      allowedElements={[
        'p',
        'ul',
        'ol',
        'li',
        'strong',
        'em',
        'code',
        'pre',
        'a',
        'h1',
        'h2',
        'h3',
        'br',
      ]}
      unwrapDisallowed
    >
      {text}
    </ReactMarkdown>
  );
}
