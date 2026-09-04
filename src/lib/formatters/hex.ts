export type HexResult =
  | { ok: true; value: string }
  | { ok: false; errorCode: "invalidHex" };

export function encodeHex(input: string): HexResult {
  try {
    const bytes = new TextEncoder().encode(input);
    const hex = Array.from(bytes)
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
    return { ok: true, value: hex };
  } catch {
    return { ok: false, errorCode: "invalidHex" };
  }
}

export function decodeHex(input: string): HexResult {
  const cleaned = input.trim().replace(/\s+/g, "");
  if (!/^[0-9a-fA-F]*$/.test(cleaned) || cleaned.length % 2 !== 0) {
    return { ok: false, errorCode: "invalidHex" };
  }
  try {
    const bytes = new Uint8Array(cleaned.length / 2);
    for (let i = 0; i < cleaned.length; i += 2) {
      bytes[i / 2] = parseInt(cleaned.slice(i, i + 2), 16);
    }
    return { ok: true, value: new TextDecoder().decode(bytes) };
  } catch {
    return { ok: false, errorCode: "invalidHex" };
  }
}
