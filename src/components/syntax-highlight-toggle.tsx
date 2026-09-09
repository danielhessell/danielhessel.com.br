"use client";

import { Highlighter } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { useSyntaxHighlight } from "@/components/syntax-highlight-provider";

export function SyntaxHighlightToggle() {
  const t = useTranslations("common");
  const { enabled, toggle } = useSyntaxHighlight();

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={enabled}
      aria-label={t("syntaxHighlight")}
      title={t("syntaxHighlight")}
      className={cn(
        "flex h-8 w-8 items-center justify-center rounded-md border border-border text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
        enabled && "border-accent text-accent",
      )}
    >
      <Highlighter size={16} />
    </button>
  );
}
