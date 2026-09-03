import type { FormatResult } from "@/lib/formatters/json";

export function encodeHex(input: string): FormatResult {
  try {
    const bytes = new TextEncoder().encode(input);
    const hex = Array.from(bytes)
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
    return { ok: true, value: hex };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

export function decodeHex(input: string): FormatResult {
  const cleaned = input.trim().replace(/\s+/g, "");
  if (!/^[0-9a-fA-F]*$/.test(cleaned) || cleaned.length % 2 !== 0) {
    return { ok: false, error: "Invalid hex input." };
  }
  try {
    const bytes = new Uint8Array(cleaned.length / 2);
    for (let i = 0; i < cleaned.length; i += 2) {
      bytes[i / 2] = parseInt(cleaned.slice(i, i + 2), 16);
    }
    return { ok: true, value: new TextDecoder().decode(bytes) };
  } catch {
    return { ok: false, error: "Invalid hex input." };
  }
}
