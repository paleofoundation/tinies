"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const bodyStyle = { fontFamily: "var(--tiny-font-body), sans-serif" };

const components = {
  h1: ({ children }) => (
    <h1 className="mt-10 mb-4 text-2xl font-normal text-[#1B2432] first:mt-0 sm:text-3xl" style={{ fontFamily: "var(--tiny-font-display), serif" }}>
      {children}
    </h1>
  ),
  h2: ({ children }) => (
    <h2 className="mt-8 mb-3 text-xl font-normal text-[#1B2432] sm:text-2xl" style={{ fontFamily: "var(--tiny-font-display), serif" }}>
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="mt-6 mb-2 text-lg font-normal text-[#1B2432]" style={{ fontFamily: "var(--tiny-font-display), serif" }}>
      {children}
    </h3>
  ),
  p: ({ children }) => (
    <p className="my-4 text-[#1B2432] leading-[1.75]">{children}</p>
  ),
  a: ({ href, children }) => (
    <a href={href} className="font-semibold text-[#0A6E5C] no-underline hover:underline">
      {children}
    </a>
  ),
  strong: ({ children }) => (
    <strong className="font-semibold text-[#1B2432]">{children}</strong>
  ),
  ul: ({ children }) => (
    <ul className="my-4 list-disc pl-6 space-y-1 text-[#1B2432] leading-[1.75]">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="my-4 list-decimal pl-6 space-y-1 text-[#1B2432] leading-[1.75]">{children}</ol>
  ),
  li: ({ children }) => (
    <li className="my-1">{children}</li>
  ),
  blockquote: ({ children }) => (
    <blockquote className="border-l-4 border-[#0A6E5C] pl-4 my-4 italic text-[#6B7280]">
      {children}
    </blockquote>
  ),
  code: ({ className, children }) => {
    const isInline = !className;
    if (isInline) {
      return (
        <code className="rounded bg-[#F7F7F8] px-1.5 py-0.5 text-sm text-[#1B2432]">
          {children}
        </code>
      );
    }
    return <code className="block text-sm text-[#F7F7F8]">{children}</code>;
  },
  pre: ({ children }) => (
    <pre className="my-4 overflow-x-auto rounded-[14px] bg-[#1B2432] p-4 text-[#F7F7F8] text-sm">
      {children}
    </pre>
  ),
  hr: () => <hr className="my-8 border-[#E5E7EB]" />,
};

export function MarkdownBody({ content }: { content: string }) {
  return (
    <div className="text-[#1B2432]" style={bodyStyle}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {content}
      </ReactMarkdown>
    </div>
  );
}
