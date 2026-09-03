"use client";

import { useEffect, useMemo, useState } from "react";
import { ToolLayout } from "@/components/tool-layout";
import { Panel } from "@/components/panel";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ErrorBanner } from "@/components/error-banner";
import { formatTimestamps, parseFlexible } from "@/lib/formatters/timestamp";

const FIELD_LABELS: Record<string, string> = {
  unixSeconds: "Unix seconds",
  unixMillis: "Unix milliseconds",
  iso8601: "ISO 8601",
  javaInstant: "Java Instant",
  nodeDateNow: "Node Date.now()",
  pythonDatetime: "Python datetime",
  rfc2822: "RFC 2822",
};

export default function TimestampPage() {
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
      setError("Could not parse that as a date/timestamp.");
      return;
    }
    setError(null);
    setDate(parsed);
  }

  return (
    <ToolLayout
      title="Timestamp Generator"
      description="Current time (or any input) in formats used by Java, Node, Python and more."
    >
      <div className="flex flex-wrap items-center gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Unix seconds/millis or any parseable date — leave empty for now"
          className="h-9 flex-1 min-w-[16rem] rounded-md border border-border bg-background px-3 text-sm font-mono focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        />
        <Button variant="primary" onClick={handleConvert}>
          Convert
        </Button>
      </div>
      {error && <ErrorBanner message={error} />}
      {formats && (
        <div className="grid gap-4 sm:grid-cols-2">
          {Object.entries(formats).map(([key, value]) => (
            <Panel key={key} label={FIELD_LABELS[key]} copyValue={value}>
              <Textarea rows={1} readOnly value={value} />
            </Panel>
          ))}
        </div>
      )}
    </ToolLayout>
  );
}
