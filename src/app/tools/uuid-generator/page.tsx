"use client";

import { useState } from "react";
import { ToolLayout } from "@/components/tool-layout";
import { Panel } from "@/components/panel";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

function generate(count: number) {
  return Array.from({ length: count }, () => crypto.randomUUID()).join("\n");
}

export default function UuidGeneratorPage() {
  const [count, setCount] = useState(1);
  const [output, setOutput] = useState(() => generate(1));

  return (
    <ToolLayout
      title="UUID Generator"
      description="Generate one or many UUID v4 values."
    >
      <div className="flex flex-wrap items-center gap-2">
        <label className="text-sm text-foreground/60" htmlFor="count">
          Count
        </label>
        <input
          id="count"
          type="number"
          min={1}
          max={1000}
          value={count}
          onChange={(e) =>
            setCount(Math.min(1000, Math.max(1, Number(e.target.value) || 1)))
          }
          className="h-9 w-24 rounded-md border border-border bg-background px-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        />
        <Button variant="primary" onClick={() => setOutput(generate(count))}>
          Generate
        </Button>
      </div>
      <Panel label="Result" copyValue={output}>
        <Textarea rows={12} readOnly value={output} />
      </Panel>
    </ToolLayout>
  );
}
