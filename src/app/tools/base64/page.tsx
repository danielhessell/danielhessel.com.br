"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { ToolLayout } from "@/components/tool-layout";
import { Panel } from "@/components/panel";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ErrorBanner } from "@/components/error-banner";
import { encodeBase64, decodeBase64 } from "@/lib/formatters/base64";

export default function Base64Page() {
  const t = useTranslations("tools.base64");
  const tCommon = useTranslations("common");
  const [input, setInput] = useState("Hello, world!");
  const [mode, setMode] = useState<"encode" | "decode">("encode");

  const result = useMemo(
    () => (mode === "encode" ? encodeBase64(input) : decodeBase64(input)),
    [input, mode],
  );

  return (
    <ToolLayout title={t("title")} description={t("description")}>
      <div className="flex gap-2">
        <Button
          variant={mode === "encode" ? "primary" : "secondary"}
          onClick={() => setMode("encode")}
        >
          {tCommon("encode")}
        </Button>
        <Button
          variant={mode === "decode" ? "primary" : "secondary"}
          onClick={() => setMode("decode")}
        >
          {tCommon("decode")}
        </Button>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Panel label={tCommon("input")}>
          <Textarea
            rows={10}
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
        </Panel>
        <Panel label={tCommon("output")} copyValue={result.ok ? result.value : ""}>
          {result.ok ? (
            <Textarea rows={10} readOnly value={result.value} />
          ) : (
            <ErrorBanner message={t("errors.invalid")} />
          )}
        </Panel>
      </div>
    </ToolLayout>
  );
}
