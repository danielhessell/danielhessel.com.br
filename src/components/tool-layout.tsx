import type { ReactNode } from "react";
import { ToolHeader } from "@/components/tool-header";

export function ToolLayout({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-6">
      <ToolHeader title={title} description={description} />
      {children}
    </div>
  );
}
