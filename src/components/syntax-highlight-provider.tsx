"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

const STORAGE_KEY = "syntax-highlight-enabled";

type SyntaxHighlightContextValue = {
  enabled: boolean;
  toggle: () => void;
};

const SyntaxHighlightContext = createContext<SyntaxHighlightContextValue | null>(null);

export function SyntaxHighlightProvider({ children }: { children: ReactNode }) {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored !== null) setEnabled(stored === "true");
    } catch {
      // localStorage unavailable (private mode, disabled) — keep default
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time read of persisted preference on mount
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, String(enabled));
    } catch {
      // ignore write failures
    }
  }, [enabled]);

  return (
    <SyntaxHighlightContext.Provider value={{ enabled, toggle: () => setEnabled((e) => !e) }}>
      {children}
    </SyntaxHighlightContext.Provider>
  );
}

export function useSyntaxHighlight() {
  const context = useContext(SyntaxHighlightContext);
  if (!context) {
    throw new Error("useSyntaxHighlight must be used within a SyntaxHighlightProvider");
  }
  return context;
}
