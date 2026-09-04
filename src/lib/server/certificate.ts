import { X509Certificate } from "node:crypto";
import type { CertificateInfo } from "@/lib/certificate-check-types";

// Node's own docs warn against naively splitting subjectAltName on ", " —
// a SAN value can itself contain a comma (CVE-2021-44532). Split with a
// lookahead instead. Display-only use here, not a security-sensitive check.
function parseSans(sanString: string | undefined): string[] {
  if (!sanString) return [];
  return sanString
    .split(/,\s*(?=[A-Za-z ]+:)/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function parseInfoAccess(infoAccess: string | undefined): {
  ocspUrl?: string;
  caIssuersUrl?: string;
} {
  const lines = (infoAccess ?? "")
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
  let ocspUrl: string | undefined;
  let caIssuersUrl: string | undefined;
  for (const line of lines) {
    const m = line.match(/^(OCSP|CA Issuers) - URI:(.+)$/);
    if (!m) continue;
    if (m[1] === "OCSP" && !ocspUrl) ocspUrl = m[2].trim();
    if (m[1] === "CA Issuers" && !caIssuersUrl) caIssuersUrl = m[2].trim();
  }
  return { ocspUrl, caIssuersUrl };
}

function computeIsSelfSigned(cert: X509Certificate): boolean {
  if (cert.subject.trim() !== cert.issuer.trim()) return false;
  try {
    return cert.verify(cert.publicKey);
  } catch {
    return false;
  }
}

export function parseCertificate(cert: X509Certificate): CertificateInfo {
  const validFromDate = new Date(cert.validFrom);
  const validToDate = new Date(cert.validTo);
  const now = new Date();
  const { ocspUrl, caIssuersUrl } = parseInfoAccess(cert.infoAccess ?? undefined);

  return {
    subject: cert.subject,
    issuer: cert.issuer,
    subjectAltNames: parseSans(cert.subjectAltName ?? undefined),
    validFrom: validFromDate.toISOString(),
    validTo: validToDate.toISOString(),
    isExpired: now > validToDate,
    isNotYetValid: now < validFromDate,
    daysUntilExpiry: Math.floor((validToDate.getTime() - now.getTime()) / 86_400_000),
    serialNumber: cert.serialNumber,
    fingerprintSha1: cert.fingerprint,
    fingerprintSha256: cert.fingerprint256,
    fingerprintSha512: cert.fingerprint512,
    keyUsage: cert.keyUsage ?? [],
    isCa: cert.ca,
    isSelfSigned: computeIsSelfSigned(cert),
    publicKey: {
      type: cert.publicKey.asymmetricKeyType,
      modulusLength: cert.publicKey.asymmetricKeyDetails?.modulusLength,
      namedCurve: cert.publicKey.asymmetricKeyDetails?.namedCurve,
    },
    ocspUrl,
    caIssuersUrl,
  };
}
