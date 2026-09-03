export function ToolHeader({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col gap-1 border-b border-border pb-4">
      <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
      <p className="text-sm text-foreground/60">{description}</p>
    </div>
  );
}
