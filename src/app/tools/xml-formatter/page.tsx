"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { ToolLayout } from "@/components/tool-layout";
import { Panel } from "@/components/panel";
import { ResizableSplit } from "@/components/resizable-split";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ErrorBanner } from "@/components/error-banner";
import { formatXmlPretty, minifyXml } from "@/lib/formatters/xml";

export default function XmlFormatterPage() {
  const t = useTranslations("tools.xmlFormatter");
  const tCommon = useTranslations("common");
  const [input, setInput] = useState("<root><child>value</child></root>");
  const [mode, setMode] = useState<"format" | "minify">("format");

  const result = useMemo(
    () => (mode === "format" ? formatXmlPretty(input) : minifyXml(input)),
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
      <ResizableSplit
        left={
          <Panel label={tCommon("input")}>
            <Textarea
              rows={16}
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
          </Panel>
        }
        right={
          <Panel label={tCommon("output")} copyValue={result.ok ? result.value : ""}>
            {result.ok ? (
              <Textarea rows={16} readOnly value={result.value} />
            ) : (
              <ErrorBanner message={result.error} />
            )}
          </Panel>
        }
      />
    </ToolLayout>
  );
}
