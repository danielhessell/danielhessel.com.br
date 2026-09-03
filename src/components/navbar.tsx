import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";

export function Navbar() {
  return (
    <header className="sticky top-0 z-10 border-b border-border bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-4xl items-center justify-between px-4">
        <Link href="/tools" className="text-sm font-semibold tracking-tight">
          Daniel Hessel
        </Link>
        <ThemeToggle />
      </div>
    </header>
  );
}
