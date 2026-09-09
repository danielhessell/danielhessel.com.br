"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useTranslations } from "next-intl";
import { ToolLayout } from "@/components/tool-layout";
import { Panel } from "@/components/panel";
import { ResizableSplit } from "@/components/resizable-split";
import { Textarea } from "@/components/ui/textarea";

const DEFAULT = "# Hello\n\n- item one\n- item two\n\n**bold** and _italic_.";

export default function MarkdownPreviewerPage() {
  const t = useTranslations("tools.markdownPreviewer");
  const tCommon = useTranslations("common");
  const [input, setInput] = useState(DEFAULT);

  return (
    <ToolLayout title={t("title")} description={t("description")}>
      <ResizableSplit
        left={
          <Panel label={tCommon("input")} copyValue={input}>
            <Textarea
              rows={16}
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
          </Panel>
        }
        right={
          <Panel label={tCommon("preview")}>
            <div className="prose prose-sm dark:prose-invert min-h-[16rem] max-w-none rounded-md border border-border p-3">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{input}</ReactMarkdown>
            </div>
          </Panel>
        }
      />
    </ToolLayout>
  );
}
