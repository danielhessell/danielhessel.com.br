"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { ToolLayout } from "@/components/tool-layout";
import { Panel } from "@/components/panel";
import { Textarea } from "@/components/ui/textarea";
import { ErrorBanner } from "@/components/error-banner";
import { WarningBanner } from "@/components/warning-banner";
import { decodeJwt } from "@/lib/formatters/jwt";

const SAMPLE =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";

export default function JwtDecoderPage() {
  const t = useTranslations("tools.jwtDecoder");
  const [input, setInput] = useState(SAMPLE);
  const result = useMemo(() => decodeJwt(input), [input]);

  return (
    <ToolLayout title={t("title")} description={t("description")}>
      <WarningBanner message={t("warning")} />
      <Panel label={t("labels.token")}>
        <Textarea
          rows={4}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={t("placeholder")}
        />
      </Panel>
      {result.ok ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <Panel label={t("labels.header")} copyValue={result.header}>
            <Textarea rows={8} readOnly value={result.header} />
          </Panel>
          <Panel label={t("labels.payload")} copyValue={result.payload}>
            <Textarea rows={8} readOnly value={result.payload} />
          </Panel>
        </div>
      ) : (
        <ErrorBanner message={t(`errors.${result.errorCode}`)} />
      )}
    </ToolLayout>
  );
}
