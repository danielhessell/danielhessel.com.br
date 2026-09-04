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

  const output = useMemo(() => {
    if (!result.ok || mode !== "decode") return null;
    try {
      return { value: JSON.stringify(JSON.parse(result.value), null, 2), isJson: true };
    } catch {
      return { value: result.value, isJson: false };
    }
  }, [result, mode]);

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
        <Panel
          label={
            <span className="flex items-center gap-2">
              {tCommon("output")}
              {output?.isJson && (
                <span className="rounded-full bg-accent/10 px-2 py-0.5 text-[10px] font-medium normal-case tracking-normal text-accent">
                  {t("jsonDetected")}
                </span>
              )}
            </span>
          }
          copyValue={result.ok ? (output?.value ?? result.value) : ""}
        >
          {result.ok ? (
            <Textarea rows={10} readOnly value={output?.value ?? result.value} />
          ) : (
            <ErrorBanner message={t("errors.invalid")} />
          )}
        </Panel>
      </div>
    </ToolLayout>
  );
}
