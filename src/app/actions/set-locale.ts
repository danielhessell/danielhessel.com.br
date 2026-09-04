"use server";

import { cookies } from "next/headers";
import { localeCookieName, type Locale } from "@/i18n/locales";

export async function setLocale(locale: Locale) {
  const cookieStore = await cookies();
  cookieStore.set(localeCookieName, locale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });
}
