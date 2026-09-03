"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ToolLayout } from "@/components/tool-layout";
import { Panel } from "@/components/panel";
import { Textarea } from "@/components/ui/textarea";

const DEFAULT = "# Hello\n\n- item one\n- item two\n\n**bold** and _italic_.";

export default function MarkdownPreviewerPage() {
  const [input, setInput] = useState(DEFAULT);

  return (
    <ToolLayout
      title="Markdown Previewer"
      description="Live preview of GitHub-flavored Markdown."
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Panel label="Input" copyValue={input}>
          <Textarea
            rows={16}
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
        </Panel>
        <Panel label="Preview">
          <div className="prose prose-sm dark:prose-invert min-h-[16rem] max-w-none rounded-md border border-border p-3">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{input}</ReactMarkdown>
          </div>
        </Panel>
      </div>
    </ToolLayout>
  );
}
