"use client";

import { useState } from "react";
import { ToolLayout } from "@/components/tool-layout";
import { Textarea } from "@/components/ui/textarea";
import { textStats } from "@/lib/formatters/text-stats";

export default function TextCounterPage() {
  const [input, setInput] = useState("");
  const stats = textStats(input);

  const items = [
    { label: "Characters", value: stats.characters },
    { label: "Characters (no spaces)", value: stats.charactersNoSpaces },
    { label: "Words", value: stats.words },
    { label: "Lines", value: stats.lines },
  ];

  return (
    <ToolLayout
      title="Text Counter"
      description="Count characters, words and lines."
    >
      <Textarea
        rows={10}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Paste or type text here..."
      />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {items.map((item) => (
          <div
            key={item.label}
            className="rounded-md border border-border p-3"
          >
            <div className="text-2xl font-semibold tabular-nums">
              {item.value}
            </div>
            <div className="text-xs text-foreground/60">{item.label}</div>
          </div>
        ))}
      </div>
    </ToolLayout>
  );
}
