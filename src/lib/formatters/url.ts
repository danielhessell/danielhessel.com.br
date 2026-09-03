import type { FormatResult } from "@/lib/formatters/json";

export function encodeUrl(input: string): FormatResult {
  try {
    return { ok: true, value: encodeURIComponent(input) };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

export function decodeUrl(input: string): FormatResult {
  try {
    return { ok: true, value: decodeURIComponent(input) };
  } catch {
    return { ok: false, error: "Invalid percent-encoded input." };
  }
}
