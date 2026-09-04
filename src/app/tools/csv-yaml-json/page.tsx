"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { ToolLayout } from "@/components/tool-layout";
import { Panel } from "@/components/panel";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ErrorBanner } from "@/components/error-banner";
import { csvToJson, jsonToCsv } from "@/lib/formatters/csv-json";
import { yamlToJson, jsonToYaml } from "@/lib/formatters/yaml-json";

type Mode = "csvToJson" | "jsonToCsv" | "yamlToJson" | "jsonToYaml";

const MODES: Mode[] = ["csvToJson", "jsonToCsv", "yamlToJson", "jsonToYaml"];

const SAMPLES: Record<Mode, string> = {
  csvToJson: "name,age\nAlice,30\nBob,25",
  jsonToCsv: '[\n  { "name": "Alice", "age": "30" },\n  { "name": "Bob", "age": "25" }\n]',
  yamlToJson: "name: Alice\nage: 30\nroles:\n  - admin\n  - user",
  jsonToYaml: '{\n  "name": "Alice",\n  "roles": ["admin", "user"]\n}',
};

function convert(mode: Mode, input: string) {
  switch (mode) {
    case "csvToJson":
      return csvToJson(input);
    case "jsonToCsv":
      return jsonToCsv(input);
    case "yamlToJson":
      return yamlToJson(input);
    case "jsonToYaml":
      return jsonToYaml(input);
  }
}

export default function CsvYamlJsonPage() {
  const t = useTranslations("tools.csvYamlJson");
  const tCommon = useTranslations("common");
  const [mode, setMode] = useState<Mode>("csvToJson");
  const [input, setInput] = useState(SAMPLES.csvToJson);

  const result = useMemo(() => convert(mode, input), [mode, input]);

  function handleModeChange(next: Mode) {
    // Swap in the matching sample when the field is still at a previous
    // mode's untouched sample, so switching modes doesn't leave stale
    // CSV text sitting in a "YAML to JSON" box, etc.
    if (input === SAMPLES[mode]) setInput(SAMPLES[next]);
    setMode(next);
  }

  return (
    <ToolLayout title={t("title")} description={t("description")}>
      <div className="flex flex-wrap gap-2">
        {MODES.map((m) => (
          <Button
            key={m}
            variant={mode === m ? "primary" : "secondary"}
            onClick={() => handleModeChange(m)}
          >
            {t(`modes.${m}`)}
          </Button>
        ))}
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Panel label={tCommon("input")}>
          <Textarea
            rows={16}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={t("placeholder")}
          />
        </Panel>
        <Panel label={tCommon("output")} copyValue={result.ok ? result.value : ""}>
          {result.ok ? (
            <Textarea rows={16} readOnly value={result.value} />
          ) : (
            <ErrorBanner message={t(`errors.${result.errorCode}`)} />
          )}
        </Panel>
      </div>
    </ToolLayout>
  );
}
