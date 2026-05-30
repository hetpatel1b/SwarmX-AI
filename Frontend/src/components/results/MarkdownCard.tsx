import ReactMarkdown from "react-markdown";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function MarkdownCard({ title, content }: { title: string; content: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {content ? <ReactMarkdown className="markdown-body">{content}</ReactMarkdown> : <p className="text-slate-400">Run the swarm to generate this section.</p>}
      </CardContent>
    </Card>
  );
}
