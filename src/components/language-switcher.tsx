"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { setLocale } from "@/app/actions/set-locale";
import type { Locale } from "@/i18n/locales";

const LOCALE_LABELS: Record<Locale, string> = {
  "pt-BR": "PT",
  en: "EN",
  es: "ES",
};

const LOCALE_NAMES: Record<Locale, string> = {
  "pt-BR": "Português",
  en: "English",
  es: "Español",
};

const LOCALE_OPTIONS: Locale[] = ["pt-BR", "en", "es"];

export function LanguageSwitcher() {
  const router = useRouter();
  // Unlike ThemeToggle, no useMounted() guard is needed here: locale is
  // resolved server-side from the cookie before HTML is produced and flows
  // into NextIntlClientProvider, so server and client markup always agree.
  const currentLocale = useLocale() as Locale;
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function handleSelect(next: Locale) {
    setOpen(false);
    await setLocale(next);
    router.refresh();
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex h-8 items-center justify-center rounded-md border border-border px-2 text-xs font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
      >
        {LOCALE_LABELS[currentLocale]}
      </button>
      {open && (
        <div
          role="menu"
          className="absolute right-0 z-20 mt-2 w-32 rounded-md border border-border bg-background py-1 shadow-md"
        >
          {LOCALE_OPTIONS.map((loc) => (
            <button
              key={loc}
              type="button"
              role="menuitem"
              onClick={() => handleSelect(loc)}
              className="flex w-full items-center justify-between px-3 py-1.5 text-left text-sm text-foreground hover:bg-muted"
            >
              <span>{LOCALE_NAMES[loc]}</span>
              {loc === currentLocale && <span className="text-accent">•</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
