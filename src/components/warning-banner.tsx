export function WarningBanner({ message }: { message: string }) {
  return (
    <div className="rounded-md border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-700 dark:text-amber-400">
      {message}
    </div>
  );
}
