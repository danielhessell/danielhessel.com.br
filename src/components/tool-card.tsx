import Link from "next/link";
import { getTranslations } from "next-intl/server";
import type { Tool } from "@/lib/tools-registry";

export async function ToolCard({ tool }: { tool: Tool }) {
  const Icon = tool.icon;
  const t = await getTranslations(`tools.${tool.messageKey}`);

  return (
    <Link
      href={`/tools/${tool.slug}`}
      className="group flex flex-col gap-3 rounded-md border border-border p-4 transition-colors hover:border-foreground/30 hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
    >
      <Icon size={18} className="text-foreground/70" />
      <div className="flex flex-col gap-1">
        <span className="text-sm font-medium">{t("title")}</span>
        <span className="text-xs text-foreground/60">{t("description")}</span>
      </div>
    </Link>
  );
}
