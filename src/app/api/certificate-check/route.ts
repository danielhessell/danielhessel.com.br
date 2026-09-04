import { X509Certificate } from "node:crypto";
import { NextResponse } from "next/server";
import { parseCertificate } from "@/lib/server/certificate";
import { checkRevocation } from "@/lib/server/revocation";
import { extractCertificateFromFile } from "@/lib/server/extract-certificate";
import type { CertificateCheckResponse, RevocationMode } from "@/lib/certificate-check-types";

export const runtime = "nodejs";
// "auto" mode can chain a CA-Issuers fetch + OCSP round trip + a CRL fetch
// (which alone allows up to 10s) if OCSP doesn't resolve — budget for the
// worst case, not just the common one.
export const maxDuration = 30;

const MAX_PEM_LENGTH = 32 * 1024;
const MAX_FILE_LENGTH_BASE64 = 64 * 1024; // ~48KB decoded — PFX bundles are small
const REVOCATION_MODES: RevocationMode[] = ["auto", "ocsp", "crl"];

function invalidPem() {
  return NextResponse.json(
    { ok: false as const, errorCode: "invalidPem" as const },
    { status: 400 },
  );
}

function invalidPfx() {
  return NextResponse.json(
    { ok: false as const, errorCode: "invalidPfx" as const },
    { status: 400 },
  );
}

export async function POST(request: Request): Promise<NextResponse<CertificateCheckResponse>> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return invalidPem();
  }

  const { pem, fileBase64, password, mode } = (body ?? {}) as {
    pem?: unknown;
    fileBase64?: unknown;
    password?: unknown;
    mode?: unknown;
  };

  const revocationMode: RevocationMode = REVOCATION_MODES.includes(mode as RevocationMode)
    ? (mode as RevocationMode)
    : "auto";

  let cert: X509Certificate;

  if (typeof pem === "string") {
    if (pem.length === 0 || pem.length > MAX_PEM_LENGTH) return invalidPem();
    try {
      cert = new X509Certificate(pem);
    } catch {
      return invalidPem();
    }
  } else if (typeof fileBase64 === "string") {
    if (fileBase64.length === 0 || fileBase64.length > MAX_FILE_LENGTH_BASE64) return invalidPfx();
    if (password !== undefined && typeof password !== "string") return invalidPfx();
    let bytes: Buffer;
    try {
      bytes = Buffer.from(fileBase64, "base64");
    } catch {
      return invalidPfx();
    }
    const extracted = extractCertificateFromFile(bytes, password);
    if (!extracted) return invalidPfx();
    cert = extracted;
  } else {
    return invalidPem();
  }

  try {
    const certificate = parseCertificate(cert);
    const revocation = await checkRevocation(
      cert,
      certificate.ocspUrl,
      certificate.caIssuersUrl,
      revocationMode,
    );
    return NextResponse.json({ ok: true, certificate, revocation });
  } catch {
    return NextResponse.json({ ok: false, errorCode: "unexpectedError" }, { status: 500 });
  }
}
