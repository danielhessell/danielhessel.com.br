import type { FormatResult } from "@/lib/formatters/json";

export function encodeBase64(input: string): FormatResult {
  try {
    const bytes = new TextEncoder().encode(input);
    let binary = "";
    for (const byte of bytes) binary += String.fromCharCode(byte);
    return { ok: true, value: btoa(binary) };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

export function decodeBase64(input: string): FormatResult {
  try {
    const binary = atob(input);
    const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
    return { ok: true, value: new TextDecoder().decode(bytes) };
  } catch {
    return { ok: false, error: "Invalid Base64 input." };
  }
}
