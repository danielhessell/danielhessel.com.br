"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { ToolLayout } from "@/components/tool-layout";
import { Panel } from "@/components/panel";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ErrorBanner } from "@/components/error-banner";
import { formatJson, minifyJson } from "@/lib/formatters/json";

export default function JsonFormatterPage() {
  const t = useTranslations("tools.jsonFormatter");
  const tCommon = useTranslations("common");
  const [input, setInput] = useState('{\n  "hello": "world"\n}');
  const [mode, setMode] = useState<"format" | "minify">("format");

  const result = useMemo(
    () => (mode === "format" ? formatJson(input) : minifyJson(input)),
    [input, mode],
  );

  return (
    <ToolLayout title={t("title")} description={t("description")}>
      <div className="flex gap-2">
        <Button
          variant={mode === "format" ? "primary" : "secondary"}
          onClick={() => setMode("format")}
        >
          {tCommon("prettyPrint")}
        </Button>
        <Button
          variant={mode === "minify" ? "primary" : "secondary"}
          onClick={() => setMode("minify")}
        >
          {tCommon("minify")}
        </Button>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Panel label={tCommon("input")}>
          <Textarea
            rows={16}
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
        </Panel>
        <Panel label={tCommon("output")} copyValue={result.ok ? result.value : ""}>
          {result.ok ? (
            <Textarea rows={16} readOnly value={result.value} />
          ) : (
            <ErrorBanner message={result.error} />
          )}
        </Panel>
      </div>
    </ToolLayout>
  );
}
