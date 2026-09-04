import { webcrypto, X509Certificate } from "node:crypto";
import * as pkijs from "pkijs";
import { safeFetch } from "@/lib/server/safe-fetch";
import { toPkijsCertificate } from "@/lib/server/pkijs-cert";
import type { RevocationInfo } from "@/lib/certificate-check-types";

let engineReady = false;
function ensureEngine() {
  if (engineReady) return;
  pkijs.setEngine(
    "nodeEngine",
    new pkijs.CryptoEngine({ name: "nodeEngine", crypto: webcrypto as Crypto }),
  );
  engineReady = true;
}

const STATUS_NAMES = ["good", "revoked", "unknown"] as const;

export async function checkRevocationViaOcsp(
  cert: X509Certificate,
  ocspUrl: string | undefined,
  caIssuersUrl: string | undefined,
): Promise<RevocationInfo> {
  if (!ocspUrl) {
    return { status: "unavailable", reason: "noOcspUrl" };
  }
  if (!caIssuersUrl) {
    return { status: "unavailable", reason: "issuerCertUnavailable" };
  }

  let issuerCert: X509Certificate;
  try {
    const issuerBytes = await safeFetch(caIssuersUrl);
    issuerCert = new X509Certificate(Buffer.from(issuerBytes));
  } catch {
    return { status: "unavailable", reason: "issuerCertUnavailable" };
  }

  try {
    ensureEngine();

    const pkijsCert = toPkijsCertificate(cert);
    const pkijsIssuerCert = toPkijsCertificate(issuerCert);

    const ocspReq = new pkijs.OCSPRequest();
    await ocspReq.createForCertificate(pkijsCert, {
      hashAlgorithm: "SHA-1",
      issuerCertificate: pkijsIssuerCert,
    });
    const requestBer = ocspReq.toSchema(true).toBER();

    const responseBytes = await safeFetch(ocspUrl, {
      method: "POST",
      headers: { "Content-Type": "application/ocsp-request" },
      body: requestBer,
    });

    const ocspResponse = pkijs.OCSPResponse.fromBER(responseBytes);
    if (ocspResponse.responseStatus.valueBlock.valueDec !== 0 || !ocspResponse.responseBytes) {
      return { status: "unavailable", reason: "ocspRequestFailed" };
    }

    const { status: statusCode } = await ocspResponse.getCertificateStatus(
      pkijsCert,
      pkijsIssuerCert,
    );
    const status = STATUS_NAMES[statusCode] ?? "unknown";

    // getCertificateStatus only returns the status code — dig into the
    // matching SingleResponse ourselves for thisUpdate/nextUpdate/revokedAt.
    // Our request always contains exactly one CertID, so there's exactly
    // one SingleResponse to consider.
    const basicResponse = pkijs.BasicOCSPResponse.fromBER(
      ocspResponse.responseBytes.response.getValue(),
    );
    const single = basicResponse.tbsResponseData.responses[0];

    let revokedAt: string | undefined;
    if (status === "revoked") {
      try {
        const revokedInfo = single.certStatus.valueBlock.value[0];
        if (revokedInfo && typeof revokedInfo.toDate === "function") {
          revokedAt = revokedInfo.toDate().toISOString();
        }
      } catch {
        // best-effort only — status itself is already known
      }
    }

    return {
      status,
      method: "ocsp",
      thisUpdate: single?.thisUpdate?.toISOString() ?? new Date().toISOString(),
      nextUpdate: single?.nextUpdate?.toISOString(),
      revokedAt,
      checkedVia: ocspUrl,
    };
  } catch {
    return { status: "unavailable", reason: "ocspRequestFailed" };
  }
}
