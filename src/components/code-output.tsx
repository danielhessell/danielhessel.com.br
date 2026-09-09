import type { HighlightSegment } from "@/lib/highlight/json";

export function CodeOutput({ segments }: { segments: HighlightSegment[] }) {
  return (
    <pre className="w-full max-h-[24rem] overflow-y-auto whitespace-pre-wrap break-words rounded-md border border-border bg-background p-3 font-mono text-sm text-foreground sm:max-h-none sm:overflow-visible">
      {segments.map((segment, index) =>
        segment.className ? (
          <span key={index} className={segment.className}>
            {segment.text}
          </span>
        ) : (
          segment.text
        ),
      )}
    </pre>
  );
}
