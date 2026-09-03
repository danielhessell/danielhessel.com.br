"use client";

import { useMemo, useState } from "react";
import { ToolLayout } from "@/components/tool-layout";
import { Panel } from "@/components/panel";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ErrorBanner } from "@/components/error-banner";
import { encodeBase64, decodeBase64 } from "@/lib/formatters/base64";

export default function Base64Page() {
  const [input, setInput] = useState("Hello, world!");
  const [mode, setMode] = useState<"encode" | "decode">("encode");

  const result = useMemo(
    () => (mode === "encode" ? encodeBase64(input) : decodeBase64(input)),
    [input, mode],
  );

  return (
    <ToolLayout
      title="Base64 Encode/Decode"
      description="Convert text to and from Base64."
    >
      <div className="flex gap-2">
        <Button
          variant={mode === "encode" ? "primary" : "secondary"}
          onClick={() => setMode("encode")}
        >
          Encode
        </Button>
        <Button
          variant={mode === "decode" ? "primary" : "secondary"}
          onClick={() => setMode("decode")}
        >
          Decode
        </Button>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Panel label="Input">
          <Textarea
            rows={10}
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
        </Panel>
        <Panel label="Output" copyValue={result.ok ? result.value : ""}>
          {result.ok ? (
            <Textarea rows={10} readOnly value={result.value} />
          ) : (
            <ErrorBanner message={result.error} />
          )}
        </Panel>
      </div>
    </ToolLayout>
  );
}
