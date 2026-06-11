import { useMemo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark, oneLight } from "react-syntax-highlighter/dist/esm/styles/prism";
import { cn } from "@/lib/utils";
import useTheme from "@/hooks/useTheme";
import type { Components } from "react-markdown";

interface MarkdownRendererProps {
  content: string;
  className?: string;
  onImageClick?: (url: string) => void;
}

export default function MarkdownRenderer({
  content,
  className,
  onImageClick,
}: MarkdownRendererProps) {
  const { isDark } = useTheme();

  const components: Components = useMemo(
    () => ({
      code({ inline, className: codeClassName, children, ...props }: any) {
        const match = /language-(\w+)/.exec(codeClassName || "");
        const language = match ? match[1] : undefined;

        if (!inline && language) {
          return (
            <SyntaxHighlighter
              style={isDark ? oneDark : oneLight}
              language={language}
              PreTag="div"
              customStyle={{
                margin: "1rem 0",
                padding: "1rem",
                borderRadius: "10px",
                fontSize: "13px",
                lineHeight: 1.6,
                background: "var(--app-code-bg)",
                border: "1px solid var(--app-border)",
              }}
              codeTagProps={{
                style: {
                  fontFamily: '"SF Mono", Menlo, Monaco, Consolas, monospace',
                  fontSize: "13px",
                },
              }}
            >
              {String(children).replace(/\n$/, "")}
            </SyntaxHighlighter>
          );
        }

        if (inline) {
          return (
            <code
              className={cn("px-1.5 py-0.5 rounded text-[0.9em]", codeClassName)}
              style={{
                background: "var(--app-code-bg)",
                fontFamily: '"SF Mono", Menlo, Monaco, Consolas, monospace',
                color: "var(--app-text-primary)",
              }}
              {...props}
            >
              {children}
            </code>
          );
        }

        return (
          <pre
            className="my-4 p-4 rounded-xl overflow-x-auto"
            style={{
              background: "var(--app-code-bg)",
              border: "1px solid var(--app-border)",
            }}
          >
            <code
              className={codeClassName}
              style={{
                fontFamily: '"SF Mono", Menlo, Monaco, Consolas, monospace',
                fontSize: "13px",
                lineHeight: 1.6,
                color: "var(--app-text-primary)",
              }}
              {...props}
            >
              {children}
            </code>
          </pre>
        );
      },
      img({ src, alt }) {
        return (
          <img
            src={src ?? ""}
            alt={alt ?? ""}
            className="my-3 rounded-xl max-w-full cursor-zoom-in transition-transform hover:scale-[1.01]"
            loading="lazy"
            onClick={() => src && onImageClick?.(src)}
          />
        );
      },
      a({ href, children, ...props }) {
        const isExternal = href?.startsWith("http");
        return (
          <a
            href={href}
            target={isExternal ? "_blank" : undefined}
            rel={isExternal ? "noopener noreferrer" : undefined}
            className="transition-opacity hover:opacity-80"
            style={{ color: "var(--app-accent)" }}
            {...props}
          >
            {children}
          </a>
        );
      },
      blockquote({ children }) {
        return (
          <blockquote
            className="my-4 px-4 py-2 rounded-r-lg"
            style={{
              borderLeft: "4px solid var(--app-accent)",
              background: "var(--app-surface-secondary)",
              color: "var(--app-text-secondary)",
            }}
          >
            {children}
          </blockquote>
        );
      },
      table({ children }) {
        return (
          <div className="my-4 overflow-x-auto rounded-lg border" style={{ borderColor: "var(--app-border)" }}>
            <table className="w-full text-sm border-collapse">{children}</table>
          </div>
        );
      },
      th({ children }) {
        return (
          <th
            className="px-3 py-2 text-left font-semibold border"
            style={{
              background: "var(--app-surface-secondary)",
              borderColor: "var(--app-border)",
              color: "var(--app-text-primary)",
            }}
          >
            {children}
          </th>
        );
      },
      td({ children }) {
        return (
          <td
            className="px-3 py-2 border"
            style={{
              borderColor: "var(--app-border)",
              color: "var(--app-text-primary)",
            }}
          >
            {children}
          </td>
        );
      },
      h1({ children }) {
        return (
          <h1
            className="text-3xl font-bold mt-8 mb-4 pb-3"
            style={{
              color: "var(--app-text-primary)",
              borderBottom: "1px solid var(--app-border)",
            }}
          >
            {children}
          </h1>
        );
      },
      h2({ children }) {
        return (
          <h2
            className="text-2xl font-semibold mt-6 mb-3"
            style={{ color: "var(--app-text-primary)" }}
          >
            {children}
          </h2>
        );
      },
      h3({ children }) {
        return (
          <h3
            className="text-xl font-semibold mt-5 mb-2.5"
            style={{ color: "var(--app-text-primary)" }}
          >
            {children}
          </h3>
        );
      },
      p({ children }) {
        return (
          <p
            className="my-3 leading-relaxed"
            style={{ color: "var(--app-text-primary)" }}
          >
            {children}
          </p>
        );
      },
      ul({ children }) {
        return (
          <ul
            className="my-3 pl-6 list-disc space-y-1.5"
            style={{ color: "var(--app-text-primary)" }}
          >
            {children}
          </ul>
        );
      },
      ol({ children }) {
        return (
          <ol
            className="my-3 pl-6 list-decimal space-y-1.5"
            style={{ color: "var(--app-text-primary)" }}
          >
            {children}
          </ol>
        );
      },
      hr() {
        return (
          <hr
            className="my-6"
            style={{ borderTop: "1px solid var(--app-border)" }}
          />
        );
      },
      input({ type, checked, disabled }) {
        if (type === "checkbox") {
          return (
            <input
              type="checkbox"
              defaultChecked={checked}
              disabled={disabled ?? true}
              className="mr-2 align-middle"
              style={{ accentColor: "var(--app-accent)" }}
            />
          );
        }
        return <input type={type} disabled={disabled} />;
      },
    }),
    [isDark, onImageClick]
  );

  if (!content) return null;

  return (
    <div className={cn("markdown-body w-full", className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        components={components}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
