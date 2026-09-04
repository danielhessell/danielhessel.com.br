"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { copyToClipboard } from "@/lib/utils";

export function CopyButton({ text }: { text: string }) {
  const t = useTranslations("common");
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    if (!text) return;
    await copyToClipboard(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <Button
      type="button"
      variant="ghost"
      onClick={handleCopy}
      disabled={!text}
      className="h-7 px-2 text-xs"
    >
      {copied ? <Check size={13} /> : <Copy size={13} />}
      {copied ? t("copied") : t("copy")}
    </Button>
  );
}
