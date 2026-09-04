import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { tools } from "@/lib/tools-registry";
import { ToolCard } from "@/components/tool-card";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("toolsHub");
  return { title: t("metaTitle"), description: t("metaDescription") };
}

export default async function ToolsPage() {
  const t = await getTranslations("toolsHub");

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">{t("title")}</h1>
        <p className="text-sm text-foreground/60">{t("subtitle")}</p>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
        {tools.map((tool) => (
          <ToolCard key={tool.slug} tool={tool} />
        ))}
      </div>
    </div>
  );
}
