export const locales = ["pt-BR", "en", "es"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "pt-BR";
export const localeCookieName = "NEXT_LOCALE";
