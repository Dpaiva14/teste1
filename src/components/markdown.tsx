import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";

/**
 * Renders lesson markdown. Raw HTML is NOT enabled (react-markdown ignores it), so content authored by
 * admins cannot inject scripts. Links are restricted to http(s)/mailto/relative and open externally safely.
 */
export function Markdown({ children, className }: { children: string; className?: string }) {
  return (
    <div className={cn("prose-academy", className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          a({ href, children: kids }) {
            const safe = typeof href === "string" && /^(https?:|mailto:|\/|#)/i.test(href);
            if (!safe) return <span>{kids}</span>;
            const external = /^https?:/i.test(href);
            return (
              <a href={href} {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
                {kids}
              </a>
            );
          },
          table({ children: kids }) {
            return (
              <div className="overflow-x-auto">
                <table>{kids}</table>
              </div>
            );
          },
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
