"use client";

import { useMemo, useState } from "react";
import { ToolLayout } from "@/components/tool-layout";
import { Panel } from "@/components/panel";
import { Textarea } from "@/components/ui/textarea";
import { ErrorBanner } from "@/components/error-banner";
import { WarningBanner } from "@/components/warning-banner";
import { decodeJwt } from "@/lib/formatters/jwt";

const SAMPLE =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";

export default function JwtDecoderPage() {
  const [input, setInput] = useState(SAMPLE);
  const result = useMemo(() => decodeJwt(input), [input]);

  return (
    <ToolLayout
      title="JWT Decoder"
      description="Decode a JWT's header and payload."
    >
      <WarningBanner message="Signature is NOT verified — this only decodes the header and payload. Never treat a decoded-but-unverified token as trusted." />
      <Panel label="Token">
        <Textarea
          rows={4}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Paste a JWT..."
        />
      </Panel>
      {result.ok ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <Panel label="Header" copyValue={result.header}>
            <Textarea rows={8} readOnly value={result.header} />
          </Panel>
          <Panel label="Payload" copyValue={result.payload}>
            <Textarea rows={8} readOnly value={result.payload} />
          </Panel>
        </div>
      ) : (
        <ErrorBanner message={result.error} />
      )}
    </ToolLayout>
  );
}
