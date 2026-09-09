import type { ReactNode } from "react";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { SyntaxHighlightProvider } from "@/components/syntax-highlight-provider";

export default async function ToolsLayout({ children }: { children: ReactNode }) {
  const [locale, messages] = await Promise.all([getLocale(), getMessages()]);

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <SyntaxHighlightProvider>
        <div className="flex min-h-full flex-1 flex-col bg-background">
          <Navbar />
          <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8">
            {children}
          </main>
          <Footer />
        </div>
      </SyntaxHighlightProvider>
    </NextIntlClientProvider>
  );
}
