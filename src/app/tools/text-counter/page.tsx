"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { ToolLayout } from "@/components/tool-layout";
import { Textarea } from "@/components/ui/textarea";
import { textStats } from "@/lib/formatters/text-stats";

export default function TextCounterPage() {
  const t = useTranslations("tools.textCounter");
  const [input, setInput] = useState("");
  const stats = textStats(input);

  const items = [
    { label: t("stats.characters"), value: stats.characters },
    { label: t("stats.charactersNoSpaces"), value: stats.charactersNoSpaces },
    { label: t("stats.words"), value: stats.words },
    { label: t("stats.lines"), value: stats.lines },
  ];

  return (
    <ToolLayout title={t("title")} description={t("description")}>
      <Textarea
        rows={10}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder={t("placeholder")}
      />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {items.map((item) => (
          <div
            key={item.label}
            className="rounded-md border border-border p-3"
          >
            <div className="text-2xl font-semibold tabular-nums">
              {item.value}
            </div>
            <div className="text-xs text-foreground/60">{item.label}</div>
          </div>
        ))}
      </div>
    </ToolLayout>
  );
}
