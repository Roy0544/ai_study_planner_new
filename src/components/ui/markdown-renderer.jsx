import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";
import { CheckCircle2, Circle } from "lucide-react";

// Utility to extract raw text from React node children
const extractText = (node) => {
  if (typeof node === 'string') return node;
  if (typeof node === 'number') return node.toString();
  if (Array.isArray(node)) return node.map(extractText).join('');
  if (node && node.props && node.props.children) return extractText(node.props.children);
  return '';
};

export function MarkdownRenderer({ content, className, checkedSections, onToggleSection }) {
  return (
    <div className={cn("prose prose-sm dark:prose-invert max-w-none", className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h2: ({ children }) => {
            const sectionTitle = extractText(children).trim();
            const isChecked = checkedSections?.includes(sectionTitle);
            
            return (
              <div className="flex items-center justify-between mt-8 mb-3 pb-2 border-b border-border/50 group">
                <h2 className="text-xl font-bold text-primary flex items-center gap-2 m-0 border-none pb-0">
                  {children}
                </h2>
                {onToggleSection && (
                  <button
                    onClick={() => onToggleSection(sectionTitle)}
                    className={cn(
                      "flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors border",
                      isChecked 
                        ? "bg-emerald-500 text-white border-emerald-600 hover:bg-emerald-600 shadow-sm" 
                        : "bg-muted text-muted-foreground border-transparent hover:bg-muted/80 hover:text-foreground"
                    )}
                  >
                    {isChecked ? <CheckCircle2 className="w-4 h-4" /> : <Circle className="w-4 h-4" />}
                    {isChecked ? "Completed" : "Mark Complete"}
                  </button>
                )}
              </div>
            );
          },
          h3: ({ children }) => <h3 className="text-base font-bold mt-5 mb-2 text-foreground">{children}</h3>,
          blockquote: ({ children }) => <blockquote className="border-l-4 border-primary/50 bg-primary/5 px-4 py-3 rounded-r-xl my-4 text-sm text-muted-foreground not-italic">{children}</blockquote>,
          ul: ({ children }) => <ul className="space-y-2 my-3 pl-4">{children}</ul>,
          li: ({ children }) => <li className="text-sm text-muted-foreground flex gap-2 items-start"><span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary/50 shrink-0" /><span>{children}</span></li>,
          strong: ({ children }) => <strong className="font-bold text-foreground">{children}</strong>,
          p: ({ children }) => <p className="text-sm text-muted-foreground leading-relaxed mb-3">{children}</p>,
          code: ({ children }) => <code className="px-1.5 py-0.5 rounded bg-muted text-xs font-mono text-primary">{children}</code>,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
