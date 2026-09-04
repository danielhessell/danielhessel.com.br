import type { X509Certificate } from "node:crypto";
import * as pkijs from "pkijs";
import { safeFetch } from "@/lib/server/safe-fetch";
import { toPkijsCertificate } from "@/lib/server/pkijs-cert";
import type { RevocationInfo } from "@/lib/certificate-check-types";

// CRLs are a different order of magnitude from OCSP responses/certs — some
// CAs (especially root CAs) publish CRLs in the multi-megabyte range.
const CRL_MAX_BYTES = 10 * 1024 * 1024;
const CRL_TIMEOUT_MS = 10_000;

function getCrlUrls(pkijsCert: pkijs.Certificate): string[] {
  const ext = pkijsCert.extensions?.find((e) => e.extnID === "2.5.29.31"); // id-ce-cRLDistributionPoints
  const cdp = ext?.parsedValue as pkijs.CRLDistributionPoints | undefined;
  if (!cdp) return [];

  const urls: string[] = [];
  for (const dp of cdp.distributionPoints) {
    const name = dp.distributionPoint;
    if (!Array.isArray(name)) continue; // skip the rare nameRelativeToCRLIssuer form
    for (const generalName of name) {
      if (generalName.type === 6 && typeof generalName.value === "string") {
        urls.push(generalName.value);
      }
    }
  }
  return urls;
}

export async function checkRevocationViaCrl(cert: X509Certificate): Promise<RevocationInfo> {
  let pkijsCert: pkijs.Certificate;
  try {
    pkijsCert = toPkijsCertificate(cert);
  } catch {
    return { status: "unavailable", reason: "crlRequestFailed" };
  }

  const crlUrls = getCrlUrls(pkijsCert);
  if (crlUrls.length === 0) {
    return { status: "unavailable", reason: "noCrlUrl" };
  }

  for (const url of crlUrls) {
    try {
      const bytes = await safeFetch(
        url,
        undefined,
        { maxBytes: CRL_MAX_BYTES, timeoutMs: CRL_TIMEOUT_MS },
      );
      const crl = pkijs.CertificateRevocationList.fromBER(bytes);
      const revoked = crl.isCertificateRevoked(pkijsCert);

      let revokedAt: string | undefined;
      if (revoked && crl.revokedCertificates) {
        const serial = pkijsCert.serialNumber.toBigInt();
        const entry = crl.revokedCertificates.find(
          (rc) => rc.userCertificate.toBigInt() === serial,
        );
        revokedAt = entry?.revocationDate.value.toISOString();
      }

      return {
        status: revoked ? "revoked" : "good",
        method: "crl",
        thisUpdate: crl.thisUpdate.value.toISOString(),
        nextUpdate: crl.nextUpdate?.value.toISOString(),
        revokedAt,
        checkedVia: url,
      };
    } catch {
      // try the next distribution point, if any
    }
  }

  return { status: "unavailable", reason: "crlRequestFailed" };
}
