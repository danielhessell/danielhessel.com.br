import type { ReactNode } from "react";
import { CopyButton } from "@/components/copy-button";

export function Panel({
  label,
  copyValue,
  children,
}: {
  label: string;
  copyValue?: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-1 flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wide text-foreground/60">
          {label}
        </span>
        {copyValue !== undefined && <CopyButton text={copyValue} />}
      </div>
      {children}
    </div>
  );
}
