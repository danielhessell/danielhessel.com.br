"use client";

import { useEffect, useState } from "react";
import { ToolLayout } from "@/components/tool-layout";
import { Panel } from "@/components/panel";
import { Textarea } from "@/components/ui/textarea";
import { WarningBanner } from "@/components/warning-banner";
import { hashText } from "@/lib/formatters/hash";

export default function HashGeneratorPage() {
  const [input, setInput] = useState("Hello, world!");
  const [hashes, setHashes] = useState({ md5: "", sha1: "", sha256: "" });

  useEffect(() => {
    let cancelled = false;
    hashText(input).then((result) => {
      if (!cancelled) setHashes(result);
    });
    return () => {
      cancelled = true;
    };
  }, [input]);

  return (
    <ToolLayout
      title="Hash Generator"
      description="MD5, SHA-1 and SHA-256 digests of text."
    >
      <WarningBanner message="MD5 and SHA-1 are broken for security purposes — use them only for checksums, not for passwords or integrity against a malicious actor." />
      <Textarea
        rows={6}
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />
      <div className="grid gap-4">
        <Panel label="MD5" copyValue={hashes.md5}>
          <Textarea rows={1} readOnly value={hashes.md5} />
        </Panel>
        <Panel label="SHA-1" copyValue={hashes.sha1}>
          <Textarea rows={1} readOnly value={hashes.sha1} />
        </Panel>
        <Panel label="SHA-256" copyValue={hashes.sha256}>
          <Textarea rows={1} readOnly value={hashes.sha256} />
        </Panel>
      </div>
    </ToolLayout>
  );
}
