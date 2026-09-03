"use client";

import { useState } from "react";
import { ToolLayout } from "@/components/tool-layout";
import { Panel } from "@/components/panel";
import { Textarea } from "@/components/ui/textarea";
import { caseConverters, type CaseKind } from "@/lib/formatters/case";

const LABELS: Record<CaseKind, string> = {
  upper: "UPPERCASE",
  lower: "lowercase",
  title: "Title Case",
  camel: "camelCase",
  pascal: "PascalCase",
  snake: "snake_case",
  kebab: "kebab-case",
};

export default function CaseConverterPage() {
  const [input, setInput] = useState("hello world example");

  return (
    <ToolLayout
      title="Case Converter"
      description="Convert text between common case styles."
    >
      <Textarea
        rows={4}
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />
      <div className="grid gap-4 sm:grid-cols-2">
        {(Object.keys(caseConverters) as CaseKind[]).map((kind) => (
          <Panel
            key={kind}
            label={LABELS[kind]}
            copyValue={caseConverters[kind](input)}
          >
            <Textarea rows={2} readOnly value={caseConverters[kind](input)} />
          </Panel>
        ))}
      </div>
    </ToolLayout>
  );
}
