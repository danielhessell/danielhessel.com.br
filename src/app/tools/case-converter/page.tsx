"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { ToolLayout } from "@/components/tool-layout";
import { Panel } from "@/components/panel";
import { Textarea } from "@/components/ui/textarea";
import { caseConverters, type CaseKind } from "@/lib/formatters/case";

// Format examples (camelCase/PascalCase/snake_case/kebab-case) name a code
// convention, not a language — translating them would stop matching the
// actual output shown in the panel, so they stay literal across locales.
const STATIC_LABELS: Partial<Record<CaseKind, string>> = {
  camel: "camelCase",
  pascal: "PascalCase",
  snake: "snake_case",
  kebab: "kebab-case",
};

const TRANSLATED_KINDS: CaseKind[] = ["upper", "lower", "title"];

export default function CaseConverterPage() {
  const t = useTranslations("tools.caseConverter");
  const [input, setInput] = useState("hello world example");

  return (
    <ToolLayout title={t("title")} description={t("description")}>
      <Textarea
        rows={4}
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />
      <div className="grid gap-4 sm:grid-cols-2">
        {(Object.keys(caseConverters) as CaseKind[]).map((kind) => (
          <Panel
            key={kind}
            label={
              TRANSLATED_KINDS.includes(kind)
                ? t(`labels.${kind}`)
                : STATIC_LABELS[kind]!
            }
            copyValue={caseConverters[kind](input)}
          >
            <Textarea rows={2} readOnly value={caseConverters[kind](input)} />
          </Panel>
        ))}
      </div>
    </ToolLayout>
  );
}
