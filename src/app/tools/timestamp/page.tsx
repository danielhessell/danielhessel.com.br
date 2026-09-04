"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { ToolLayout } from "@/components/tool-layout";
import { Panel } from "@/components/panel";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ErrorBanner } from "@/components/error-banner";
import { formatTimestamps, parseFlexible } from "@/lib/formatters/timestamp";

export default function TimestampPage() {
  const t = useTranslations("tools.timestamp");
  const tCommon = useTranslations("common");
  const [date, setDate] = useState<Date | null>(null);
  const [input, setInput] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Client-only initial "now" — deliberately set after mount to avoid an
  // SSR/client markup mismatch (the server-rendered instant would differ
  // from the client's by however long the request/hydration takes).
  // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional, see above
  useEffect(() => setDate(new Date()), []);

  const formats = useMemo(() => (date ? formatTimestamps(date) : null), [date]);

  function handleConvert() {
    if (!input.trim()) {
      setDate(new Date());
      setError(null);
      return;
    }
    const parsed = parseFlexible(input);
    if (!parsed) {
      setError(t("error"));
      return;
    }
    setError(null);
    setDate(parsed);
  }

  return (
    <ToolLayout title={t("title")} description={t("description")}>
      <div className="flex flex-wrap items-center gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={t("placeholder")}
          className="h-9 flex-1 min-w-[16rem] rounded-md border border-border bg-background px-3 text-sm font-mono focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        />
        <Button variant="primary" onClick={handleConvert}>
          {tCommon("convert")}
        </Button>
      </div>
      {error && <ErrorBanner message={error} />}
      {formats && (
        <div className="grid gap-4 sm:grid-cols-2">
          {Object.entries(formats).map(([key, value]) => (
            <Panel key={key} label={t(`fieldLabels.${key}`)} copyValue={value}>
              <Textarea rows={1} readOnly value={value} />
            </Panel>
          ))}
        </div>
      )}
    </ToolLayout>
  );
}
