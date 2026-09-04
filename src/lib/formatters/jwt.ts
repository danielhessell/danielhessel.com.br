export type JwtResult =
  | { ok: true; header: string; payload: string }
  | { ok: false; errorCode: "malformedToken" | "invalidEncoding" };

function base64UrlDecode(segment: string): string {
  const base64 = segment.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64.padEnd(
    base64.length + ((4 - (base64.length % 4)) % 4),
    "=",
  );
  const binary = atob(padded);
  const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

export function decodeJwt(token: string): JwtResult {
  const parts = token.trim().split(".");
  if (parts.length < 2) {
    return { ok: false, errorCode: "malformedToken" };
  }
  try {
    const header = JSON.stringify(JSON.parse(base64UrlDecode(parts[0])), null, 2);
    const payload = JSON.stringify(JSON.parse(base64UrlDecode(parts[1])), null, 2);
    return { ok: true, header, payload };
  } catch {
    return { ok: false, errorCode: "invalidEncoding" };
  }
}
