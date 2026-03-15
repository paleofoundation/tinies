"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const bodyStyle = { fontFamily: "var(--font-body), sans-serif" };

const components = {
  h1: ({ children }) => (
    <h1 className="mt-10 mb-4 text-2xl font-normal text-[var(--color-text)] first:mt-0 sm:text-3xl" style={{ fontFamily: "var(--font-heading), serif" }}>
      {children}
    </h1>
  ),
  h2: ({ children }) => (
    <h2 className="mt-8 mb-3 text-xl font-normal text-[var(--color-text)] sm:text-2xl" style={{ fontFamily: "var(--font-heading), serif" }}>
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="mt-6 mb-2 text-lg font-normal text-[var(--color-text)]" style={{ fontFamily: "var(--font-heading), serif" }}>
      {children}
    </h3>
  ),
  p: ({ children }) => (
    <p className="my-4 text-[var(--color-text)] leading-[1.8]">{children}</p>
  ),
  a: ({ href, children }) => (
    <a href={href} className="font-semibold text-[var(--color-primary)] no-underline hover:underline">
      {children}
    </a>
  ),
  strong: ({ children }) => (
    <strong className="font-semibold text-[var(--color-text)]">{children}</strong>
  ),
  ul: ({ children }) => (
    <ul className="my-4 list-disc pl-6 space-y-1 text-[var(--color-text)] leading-[1.8]">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="my-4 list-decimal pl-6 space-y-1 text-[var(--color-text)] leading-[1.8]">{children}</ol>
  ),
  li: ({ children }) => (
    <li className="my-1">{children}</li>
  ),
  blockquote: ({ children }) => (
    <blockquote className="border-l-4 border-[var(--color-primary)] pl-4 my-4 italic text-[var(--color-text-secondary)] leading-[1.8]">
      {children}
    </blockquote>
  ),
  table: ({ children }) => (
    <div className="my-6 overflow-x-auto">
      <table className="w-full min-w-[320px] border-collapse text-sm">
        {children}
      </table>
    </div>
  ),
  thead: ({ children }) => (
    <thead>
      <tr className="border-b-2 border-[var(--color-border)]">{children}</tr>
    </thead>
  ),
  tbody: ({ children }) => <tbody>{children}</tbody>,
  tr: ({ children }) => (
    <tr className="border-b border-[var(--color-border)]">{children}</tr>
  ),
  th: ({ children }) => (
    <th className="px-4 py-3 text-left font-semibold text-[var(--color-text)]" style={{ fontFamily: "var(--font-body), sans-serif" }}>
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td className="px-4 py-3 text-[var(--color-text)]">{children}</td>
  ),
  code: ({ className, children }) => {
    const isInline = !className;
    if (isInline) {
      return (
        <code className="rounded bg-[var(--color-background)] px-1.5 py-0.5 text-sm text-[var(--color-text)]">
          {children}
        </code>
      );
    }
    return <code className="block text-sm text-[#F7F7F8]">{children}</code>;
  },
  pre: ({ children }) => (
    <pre className="my-4 overflow-x-auto rounded-[var(--radius-lg)] p-4 text-sm" style={{ backgroundColor: "var(--color-text)", color: "var(--color-background)" }}>
      {children}
    </pre>
  ),
  hr: () => <hr className="my-8 border-[var(--color-border)]" />,
};

export function MarkdownBody({ content }: { content: string }) {
  return (
    <div className="text-[var(--color-text)] leading-[1.8]" style={bodyStyle}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {content}
      </ReactMarkdown>
    </div>
  );
}
