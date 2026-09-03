import type { Metadata } from "next";
import { tools } from "@/lib/tools-registry";
import { ToolCard } from "@/components/tool-card";

export const metadata: Metadata = {
  title: "Dev Tools — Daniel Hessel",
  description: "Everyday developer utilities.",
};

export default function ToolsPage() {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">Dev Tools</h1>
        <p className="text-sm text-foreground/60">
          Small utilities I keep needing. Everything runs in your browser —
          nothing is sent to a server.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
        {tools.map((tool) => (
          <ToolCard key={tool.slug} tool={tool} />
        ))}
      </div>
    </div>
  );
}
