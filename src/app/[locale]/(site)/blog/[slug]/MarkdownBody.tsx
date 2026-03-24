"use client";

import type { ReactNode } from "react";
import ReactMarkdown from "react-markdown";
import type { Components } from "react-markdown";
import remarkGfm from "remark-gfm";

const bodyStyle = { fontFamily: "var(--font-body), sans-serif" };

const components: Components = {
  h1: ({ children }: { children?: ReactNode }) => (
    <h1
      className="mt-10 mb-4 text-2xl font-normal text-[var(--color-text)] first:mt-0 sm:text-3xl"
      style={{ fontFamily: "var(--font-heading), serif" }}
    >
      {children}
    </h1>
  ),
  h2: ({ children }: { children?: ReactNode }) => (
    <h2
      className="mt-8 mb-3 text-xl font-normal text-[var(--color-text)] sm:text-2xl"
      style={{ fontFamily: "var(--font-heading), serif" }}
    >
      {children}
    </h2>
  ),
  h3: ({ children }: { children?: ReactNode }) => (
    <h3
      className="mt-6 mb-2 text-lg font-normal text-[var(--color-text)]"
      style={{ fontFamily: "var(--font-heading), serif" }}
    >
      {children}
    </h3>
  ),
  p: ({ children }: { children?: ReactNode }) => (
    <p className="my-4 leading-[1.8] text-[var(--color-text)]">{children}</p>
  ),
  a: ({ href, children }: { href?: string; children?: ReactNode }) => {
    const url = href ?? "";
    const isExternalHttp = /^https?:\/\//i.test(url);
    return (
      <a
        href={href}
        className="font-semibold text-[var(--color-primary)] no-underline hover:underline"
        {...(isExternalHttp ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      >
        {children}
      </a>
    );
  },
  strong: ({ children }: { children?: ReactNode }) => (
    <strong className="font-semibold text-[var(--color-text)]">{children}</strong>
  ),
  ul: ({ children }: { children?: ReactNode }) => (
    <ul className="my-4 list-disc space-y-1 pl-6 leading-[1.8] text-[var(--color-text)]">{children}</ul>
  ),
  ol: ({ children }: { children?: ReactNode }) => (
    <ol className="my-4 list-decimal space-y-1 pl-6 leading-[1.8] text-[var(--color-text)]">{children}</ol>
  ),
  li: ({ children }: { children?: ReactNode }) => <li className="my-1">{children}</li>,
  blockquote: ({ children }: { children?: ReactNode }) => (
    <blockquote className="my-4 border-l-4 border-[var(--color-primary)] pl-4 italic leading-[1.8] text-[var(--color-text-secondary)]">
      {children}
    </blockquote>
  ),
  table: ({ children }: { children?: ReactNode }) => (
    <div className="my-6 overflow-x-auto">
      <table className="w-full min-w-[320px] border-collapse text-sm">{children}</table>
    </div>
  ),
  thead: ({ children }: { children?: ReactNode }) => (
    <thead>
      <tr className="border-b-2 border-[var(--color-border)]">{children}</tr>
    </thead>
  ),
  tbody: ({ children }: { children?: ReactNode }) => <tbody>{children}</tbody>,
  tr: ({ children }: { children?: ReactNode }) => (
    <tr className="border-b border-[var(--color-border)]">{children}</tr>
  ),
  th: ({ children }: { children?: ReactNode }) => (
    <th
      className="px-4 py-3 text-left font-semibold text-[var(--color-text)]"
      style={{ fontFamily: "var(--font-body), sans-serif" }}
    >
      {children}
    </th>
  ),
  td: ({ children }: { children?: ReactNode }) => (
    <td className="px-4 py-3 text-[var(--color-text)]">{children}</td>
  ),
  code: ({ className, children }: { className?: string; children?: ReactNode }) => {
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
  pre: ({ children }: { children?: ReactNode }) => (
    <pre
      className="my-4 overflow-x-auto rounded-[var(--radius-lg)] p-4 text-sm"
      style={{ backgroundColor: "var(--color-text)", color: "var(--color-background)" }}
    >
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
