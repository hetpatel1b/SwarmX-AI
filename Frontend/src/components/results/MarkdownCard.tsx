import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { FileText, type LucideIcon } from "lucide-react";

interface MarkdownCardProps {
  title: string;
  content: string;
  icon?: LucideIcon;
}

export function MarkdownCard({
  title,
  content,
  icon: Icon = FileText
}: MarkdownCardProps) {
  return (
    <div className="glass-panel relative overflow-hidden rounded-2xl">
      {/* Top glow */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent" />

      {/* Header */}
      <div className="flex items-center gap-2.5 border-b border-white/[0.04] p-5">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-400">
          <Icon className="h-4 w-4" />
        </span>
        <h2 className="font-display text-base font-semibold text-white">
          {title}
        </h2>
        {content && (
          <span className="ml-auto text-[10px] uppercase tracking-wider text-slate-600">
            {content.split(/\s+/).length} words
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-5 pt-4">
        {content ? (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <ReactMarkdown className="markdown-body">{content}</ReactMarkdown>
          </motion.div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="relative flex h-16 w-16 items-center justify-center rounded-2xl border border-white/[0.06] bg-white/[0.02]"
            >
              <Icon className="h-7 w-7 text-slate-600" />
              <div className="absolute -inset-4 rounded-3xl border border-dashed border-white/[0.04]" />
            </motion.div>
            <div>
              <p className="text-sm font-medium text-slate-400">
                No data yet
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Run the swarm to generate this section
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
