import { NextRequest, NextResponse } from "next/server";
import { defaultLocale, localeCookieName, type Locale } from "@/i18n/locales";

function detectLocale(header: string | null): Locale {
  if (!header) return defaultLocale;
  const tags = header
    .split(",")
    .map((part) => {
      const [tag, qStr] = part.trim().split(";q=");
      return { tag: tag.toLowerCase(), q: qStr ? parseFloat(qStr) : 1 };
    })
    .sort((a, b) => b.q - a.q);

  for (const { tag } of tags) {
    const primary = tag.split("-")[0];
    if (primary === "pt") return "pt-BR";
    if (primary === "en") return "en";
    if (primary === "es") return "es";
  }
  return defaultLocale;
}

export function proxy(request: NextRequest) {
  const response = NextResponse.next();

  if (!request.cookies.has(localeCookieName)) {
    const detected = detectLocale(request.headers.get("accept-language"));
    response.cookies.set(localeCookieName, detected, {
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
      sameSite: "lax",
    });
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/|favicon.ico|.*\\.[\\w]+$).*)"],
};
