import { isIP } from "node:net";

const DEFAULT_MAX_RESPONSE_BYTES = 64 * 1024;
const DEFAULT_TIMEOUT_MS = 5000;

class SafeFetchError extends Error {}

export type SafeFetchOptions = {
  maxBytes?: number;
  timeoutMs?: number;
};

function isPrivateIPv4(ip: string): boolean {
  const parts = ip.split(".").map(Number);
  if (parts.length !== 4 || parts.some((p) => Number.isNaN(p))) return false;
  const [a, b] = parts;
  if (a === 127) return true; // loopback
  if (a === 10) return true; // private
  if (a === 172 && b >= 16 && b <= 31) return true; // private
  if (a === 192 && b === 168) return true; // private
  if (a === 169 && b === 254) return true; // link-local
  if (a === 0) return true; // "this" network
  if (a === 100 && b >= 64 && b <= 127) return true; // CGNAT
  return false;
}

function isPrivateIPv6(ip: string): boolean {
  const lower = ip.toLowerCase();
  if (lower === "::1") return true; // loopback
  if (lower.startsWith("fc") || lower.startsWith("fd")) return true; // ULA fc00::/7
  if (lower.startsWith("fe8") || lower.startsWith("fe9") || lower.startsWith("fea") || lower.startsWith("feb")) {
    return true; // link-local fe80::/10
  }
  // IPv4-mapped IPv6 — check the embedded IPv4. WHATWG URL normalizes the
  // dotted form (::ffff:192.168.1.1) into hex groups (::ffff:c0a8:101), so
  // both representations need handling.
  const mappedDotted = lower.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/);
  if (mappedDotted) return isPrivateIPv4(mappedDotted[1]);
  const mappedHex = lower.match(/^::ffff:([0-9a-f]{1,4}):([0-9a-f]{1,4})$/);
  if (mappedHex) {
    const g1 = parseInt(mappedHex[1], 16);
    const g2 = parseInt(mappedHex[2], 16);
    const ipv4 = [(g1 >> 8) & 0xff, g1 & 0xff, (g2 >> 8) & 0xff, g2 & 0xff].join(".");
    return isPrivateIPv4(ipv4);
  }
  return false;
}

function assertSafeUrl(rawUrl: string): URL {
  let url: URL;
  try {
    url = new URL(rawUrl);
  } catch {
    throw new SafeFetchError("Invalid URL");
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new SafeFetchError("Unsupported URL scheme");
  }
  // URL.hostname keeps surrounding brackets for IPv6 literals (e.g. "[::1]"),
  // which makes isIP() fail to recognize it as an IP at all — strip them
  // first or the private-range check below silently never runs.
  const hostname = url.hostname.replace(/^\[|\]$/g, "");
  if (hostname.toLowerCase() === "localhost") {
    throw new SafeFetchError("Refusing to fetch localhost");
  }
  const ipVersion = isIP(hostname);
  if (ipVersion === 4 && isPrivateIPv4(hostname)) {
    throw new SafeFetchError("Refusing to fetch private IPv4 address");
  }
  if (ipVersion === 6 && isPrivateIPv6(hostname)) {
    throw new SafeFetchError("Refusing to fetch private IPv6 address");
  }
  return url;
}

// Fetches a URL that came from user-supplied certificate data (AIA "CA
// Issuers"/OCSP URLs, CRL distribution points), never a URL the user typed
// directly. Guards against it pointing at internal infrastructure:
// http(s)-only, no private/loopback IP literals, a bounded timeout, one
// manually-revalidated redirect hop, and a response-size cap. Defaults suit
// certs/OCSP responses (a few KB); CRL fetches pass larger limits since CRL
// files can legitimately run into the megabytes.
// DNS-rebinding (a public hostname resolving to a private IP) is an accepted
// residual risk for this personal tool, not handled here.
export async function safeFetch(
  rawUrl: string,
  init?: RequestInit,
  options?: SafeFetchOptions,
): Promise<ArrayBuffer> {
  const maxBytes = options?.maxBytes ?? DEFAULT_MAX_RESPONSE_BYTES;
  const timeoutMs = options?.timeoutMs ?? DEFAULT_TIMEOUT_MS;

  let url = assertSafeUrl(rawUrl);

  let res = await fetch(url, {
    ...init,
    redirect: "manual",
    signal: AbortSignal.timeout(timeoutMs),
  });

  if ([301, 302, 303, 307, 308].includes(res.status)) {
    const location = res.headers.get("location");
    if (!location) throw new SafeFetchError("Redirect with no Location header");
    url = assertSafeUrl(new URL(location, url).toString());
    res = await fetch(url, {
      ...init,
      redirect: "manual",
      signal: AbortSignal.timeout(timeoutMs),
    });
    if ([301, 302, 303, 307, 308].includes(res.status)) {
      throw new SafeFetchError("Too many redirects");
    }
  }

  if (!res.ok) {
    throw new SafeFetchError(`Unexpected status ${res.status}`);
  }

  const contentLength = res.headers.get("content-length");
  if (contentLength && Number(contentLength) > maxBytes) {
    throw new SafeFetchError("Response too large");
  }

  const buffer = await res.arrayBuffer();
  if (buffer.byteLength > maxBytes) {
    throw new SafeFetchError("Response too large");
  }

  return buffer;
}
