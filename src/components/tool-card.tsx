import Link from "next/link";
import type { Tool } from "@/lib/tools-registry";

export function ToolCard({ tool }: { tool: Tool }) {
  const Icon = tool.icon;
  return (
    <Link
      href={`/tools/${tool.slug}`}
      className="group flex flex-col gap-3 rounded-md border border-border p-4 transition-colors hover:border-foreground/30 hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
    >
      <Icon size={18} className="text-foreground/70" />
      <div className="flex flex-col gap-1">
        <span className="text-sm font-medium">{tool.title}</span>
        <span className="text-xs text-foreground/60">{tool.description}</span>
      </div>
    </Link>
  );
}
