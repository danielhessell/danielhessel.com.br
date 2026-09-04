"use client";

import { useMemo, useRef, useState } from "react";
import { Upload } from "lucide-react";
import { useTranslations } from "next-intl";
import { ToolLayout } from "@/components/tool-layout";
import { Panel } from "@/components/panel";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  computeLineDiff,
  diffStats,
  splitLines,
  toSideBySideRows,
} from "@/lib/formatters/diff";

function FileUploadButton({
  label,
  onFile,
}: {
  label: string;
  onFile: (text: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <>
      <Button
        type="button"
        variant="ghost"
        onClick={() => inputRef.current?.click()}
        className="h-7 px-2 text-xs"
      >
        <Upload size={13} />
        {label}
      </Button>
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        onChange={async (e) => {
          const file = e.target.files?.[0];
          if (!file) return;
          onFile(await file.text());
          e.target.value = "";
        }}
      />
    </>
  );
}

// Picks both sides in one go: first selected file -> original, second -> modified.
function TwoFilesUploadButton({
  label,
  onFiles,
}: {
  label: string;
  onFiles: (original: string, modified: string | null) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <>
      <Button
        type="button"
        variant="secondary"
        onClick={() => inputRef.current?.click()}
        className="h-8 text-xs"
      >
        <Upload size={13} />
        {label}
      </Button>
      <input
        ref={inputRef}
        type="file"
        multiple
        className="hidden"
        onChange={async (e) => {
          const files = e.target.files;
          if (!files || files.length === 0) return;
          const [first, second] = await Promise.all(
            Array.from(files)
              .slice(0, 2)
              .map((file) => file.text()),
          );
          onFiles(first, second ?? null);
          e.target.value = "";
        }}
      />
    </>
  );
}

export default function DiffCheckerPage() {
  const t = useTranslations("tools.diffChecker");
  const [original, setOriginal] = useState("");
  const [modified, setModified] = useState("");

  const changes = useMemo(() => computeLineDiff(original, modified), [original, modified]);
  const stats = useMemo(() => diffStats(changes), [changes]);
  const rows = useMemo(() => toSideBySideRows(changes), [changes]);

  const statItems = [
    { label: t("stats.added"), value: stats.added },
    { label: t("stats.removed"), value: stats.removed },
    { label: t("stats.unchanged"), value: stats.unchanged },
  ];

  return (
    <ToolLayout title={t("title")} description={t("description")}>
      <div>
        <TwoFilesUploadButton
          label={t("uploadBoth")}
          onFiles={(first, second) => {
            setOriginal(first);
            if (second !== null) setModified(second);
          }}
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Panel
          label={
            <span className="flex items-center gap-2">
              {t("labels.original")}
              <FileUploadButton label={t("uploadFile")} onFile={setOriginal} />
            </span>
          }
        >
          <Textarea
            rows={10}
            value={original}
            onChange={(e) => setOriginal(e.target.value)}
            placeholder={t("placeholder")}
          />
        </Panel>
        <Panel
          label={
            <span className="flex items-center gap-2">
              {t("labels.modified")}
              <FileUploadButton label={t("uploadFile")} onFile={setModified} />
            </span>
          }
        >
          <Textarea
            rows={10}
            value={modified}
            onChange={(e) => setModified(e.target.value)}
            placeholder={t("placeholder")}
          />
        </Panel>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {statItems.map((item) => (
          <div key={item.label} className="rounded-md border border-border p-3">
            <div className="text-2xl font-semibold tabular-nums">{item.value}</div>
            <div className="text-xs text-foreground/60">{item.label}</div>
          </div>
        ))}
      </div>

      {/* Unified view — narrow screens */}
      <div className="overflow-x-auto rounded-md border border-border font-mono text-xs sm:hidden">
        {changes.map((change, i) =>
          splitLines(change.value).map((line, j) => (
            <div
              key={`${i}-${j}`}
              className={cn(
                "whitespace-pre px-3 py-0.5",
                change.added && "bg-green-500/10 text-green-700 dark:text-green-400",
                change.removed && "bg-red-500/10 text-red-700 dark:text-red-400",
              )}
            >
              {change.added ? "+ " : change.removed ? "- " : "  "}
              {line}
            </div>
          )),
        )}
      </div>

      {/* Side-by-side view — sm and up */}
      <div className="hidden overflow-x-auto rounded-md border border-border font-mono text-xs sm:grid sm:grid-cols-2">
        <div className="divide-y divide-border/50 border-r border-border">
          {rows.map((row, i) => (
            <div
              key={i}
              className={cn(
                "whitespace-pre px-3 py-0.5",
                row.leftChanged && "bg-red-500/10 text-red-700 dark:text-red-400",
              )}
            >
              {row.left ?? ""}
            </div>
          ))}
        </div>
        <div className="divide-y divide-border/50">
          {rows.map((row, i) => (
            <div
              key={i}
              className={cn(
                "whitespace-pre px-3 py-0.5",
                row.rightChanged && "bg-green-500/10 text-green-700 dark:text-green-400",
              )}
            >
              {row.right ?? ""}
            </div>
          ))}
        </div>
      </div>
    </ToolLayout>
  );
}
