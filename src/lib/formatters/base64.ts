export type Base64Result =
  | { ok: true; value: string }
  | { ok: false; errorCode: "invalidBase64" };

export function encodeBase64(input: string): Base64Result {
  try {
    const bytes = new TextEncoder().encode(input);
    let binary = "";
    for (const byte of bytes) binary += String.fromCharCode(byte);
    return { ok: true, value: btoa(binary) };
  } catch {
    return { ok: false, errorCode: "invalidBase64" };
  }
}

export function decodeBase64(input: string): Base64Result {
  try {
    const binary = atob(input);
    const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
    return { ok: true, value: new TextDecoder().decode(bytes) };
  } catch {
    return { ok: false, errorCode: "invalidBase64" };
  }
}
