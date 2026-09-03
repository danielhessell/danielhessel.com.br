"use client";

import { useMemo, useState } from "react";
import { ToolLayout } from "@/components/tool-layout";
import { Panel } from "@/components/panel";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ErrorBanner } from "@/components/error-banner";
import { formatXmlPretty, minifyXml } from "@/lib/formatters/xml";

export default function XmlFormatterPage() {
  const [input, setInput] = useState("<root><child>value</child></root>");
  const [mode, setMode] = useState<"format" | "minify">("format");

  const result = useMemo(
    () => (mode === "format" ? formatXmlPretty(input) : minifyXml(input)),
    [input, mode],
  );

  return (
    <ToolLayout
      title="XML Formatter"
      description="Pretty-print and minify XML."
    >
      <div className="flex gap-2">
        <Button
          variant={mode === "format" ? "primary" : "secondary"}
          onClick={() => setMode("format")}
        >
          Pretty-print
        </Button>
        <Button
          variant={mode === "minify" ? "primary" : "secondary"}
          onClick={() => setMode("minify")}
        >
          Minify
        </Button>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Panel label="Input">
          <Textarea
            rows={16}
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
        </Panel>
        <Panel label="Output" copyValue={result.ok ? result.value : ""}>
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
