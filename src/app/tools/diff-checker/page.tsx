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

const MAX_FILES = 6;

type DiffFile = { id: string; label: string; content: string };

function FileUploadButton({
  label,
  onFile,
}: {
  label: string;
  onFile: (text: string, filename: string) => void;
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
          onFile(await file.text(), file.name);
          e.target.value = "";
        }}
      />
    </>
  );
}

// Accepts any number of files in one pick — the caller decides what to do
// with them (replace the whole set when there's more than one).
function MultiFilesUploadButton({
  label,
  onFiles,
}: {
  label: string;
  onFiles: (files: { name: string; text: string }[]) => void;
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
          const fileList = e.target.files;
          if (!fileList || fileList.length === 0) return;
          const files = await Promise.all(
            Array.from(fileList).map(async (file) => ({
              name: file.name,
              text: await file.text(),
            })),
          );
          onFiles(files);
          e.target.value = "";
        }}
      />
    </>
  );
}

function DiffResult({
  base,
  file,
  showHeading,
}: {
  base: DiffFile;
  file: DiffFile;
  showHeading: boolean;
}) {
  const t = useTranslations("tools.diffChecker");
  const changes = useMemo(
    () => computeLineDiff(base.content, file.content),
    [base.content, file.content],
  );
  const stats = useMemo(() => diffStats(changes), [changes]);
  const rows = useMemo(() => toSideBySideRows(changes), [changes]);

  const statItems = [
    { label: t("stats.added"), value: stats.added },
    { label: t("stats.removed"), value: stats.removed },
    { label: t("stats.unchanged"), value: stats.unchanged },
  ];

  return (
    <div className="flex flex-col gap-3">
      {showHeading && (
        <h2 className="text-sm font-medium text-foreground/80">
          {t("compareHeading", { base: base.label, file: file.label })}
        </h2>
      )}
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
    </div>
  );
}

export default function DiffCheckerPage() {
  const t = useTranslations("tools.diffChecker");
  const [files, setFiles] = useState<DiffFile[]>(() => [
    { id: crypto.randomUUID(), label: t("labels.original"), content: "" },
    { id: crypto.randomUUID(), label: t("labels.modified"), content: "" },
  ]);

  function updateFile(id: string, patch: Partial<DiffFile>) {
    setFiles((prev) => prev.map((f) => (f.id === id ? { ...f, ...patch } : f)));
  }

  // Selecting just one file behaves like the per-panel button (replaces the
  // first slot); selecting several replaces the whole set — that's how N
  // files beyond the default two get onto the screen, no manual "add" step.
  function handleMultiUpload(uploaded: { name: string; text: string }[]) {
    if (uploaded.length === 0) return;
    if (uploaded.length === 1) {
      updateFile(files[0].id, { content: uploaded[0].text, label: uploaded[0].name });
      return;
    }
    setFiles(
      uploaded
        .slice(0, MAX_FILES)
        .map(({ name, text }) => ({ id: crypto.randomUUID(), label: name, content: text })),
    );
  }

  const base = files[0];
  const others = files.slice(1);

  return (
    <ToolLayout title={t("title")} description={t("description")}>
      <div>
        <MultiFilesUploadButton label={t("uploadBoth")} onFiles={handleMultiUpload} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {files.map((file) => (
          <Panel
            key={file.id}
            label={
              <span className="flex items-center gap-2">
                {file.label}
                <FileUploadButton
                  label={t("uploadFile")}
                  onFile={(text, name) => updateFile(file.id, { content: text, label: name })}
                />
              </span>
            }
          >
            <Textarea
              rows={10}
              value={file.content}
              onChange={(e) => updateFile(file.id, { content: e.target.value })}
              placeholder={t("placeholder")}
            />
          </Panel>
        ))}
      </div>

      <div className="flex flex-col gap-8">
        {others.map((file) => (
          <DiffResult key={file.id} base={base} file={file} showHeading={others.length > 1} />
        ))}
      </div>
    </ToolLayout>
  );
}
