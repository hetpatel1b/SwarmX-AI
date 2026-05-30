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
      <div className="flex items-center gap-2 p-5 pb-3">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-400">
          <Icon className="h-4 w-4" />
        </span>
        <h2 className="font-display text-base font-semibold text-white">
          {title}
        </h2>
      </div>

      {/* Content */}
      <div className="p-5 pt-0">
        {content ? (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <ReactMarkdown className="markdown-body">{content}</ReactMarkdown>
          </motion.div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
            <motion.div
              animate={{ y: [0, -4, 0] }}
              transition={{ duration: 2.5, repeat: Infinity }}
              className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/[0.08] bg-white/[0.03]"
            >
              <Icon className="h-6 w-6 text-slate-500" />
            </motion.div>
            <p className="text-sm text-slate-400">
              Run the swarm to generate this section.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
