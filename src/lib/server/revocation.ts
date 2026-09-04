import type { X509Certificate } from "node:crypto";
import { checkRevocationViaOcsp } from "@/lib/server/ocsp";
import { checkRevocationViaCrl } from "@/lib/server/crl";
import type { RevocationInfo, RevocationMode } from "@/lib/certificate-check-types";

export async function checkRevocation(
  cert: X509Certificate,
  ocspUrl: string | undefined,
  caIssuersUrl: string | undefined,
  mode: RevocationMode,
): Promise<RevocationInfo> {
  if (mode === "ocsp") {
    return checkRevocationViaOcsp(cert, ocspUrl, caIssuersUrl);
  }
  if (mode === "crl") {
    return checkRevocationViaCrl(cert);
  }

  // auto: OCSP first (faster, smaller payloads), CRL only if OCSP couldn't
  // resolve a status at all. Surface the OCSP failure reason if both fail —
  // it's the primary path, so that's the more informative one to show.
  const ocspResult = await checkRevocationViaOcsp(cert, ocspUrl, caIssuersUrl);
  if (ocspResult.status !== "unavailable") return ocspResult;

  const crlResult = await checkRevocationViaCrl(cert);
  if (crlResult.status !== "unavailable") return crlResult;

  return ocspResult;
}
