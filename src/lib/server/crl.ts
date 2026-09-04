import type { X509Certificate } from "node:crypto";
import * as asn1js from "asn1js";
import * as pkijs from "pkijs";
import { safeFetch } from "@/lib/server/safe-fetch";
import { toPkijsCertificate } from "@/lib/server/pkijs-cert";
import type { RevocationInfo } from "@/lib/certificate-check-types";

// CRLs are a different order of magnitude from OCSP responses/certs — some
// CAs (especially root CAs, or large national PKIs like Brazil's ICP-Brasil)
// publish CRLs in the multi-megabyte range with tens of thousands of entries.
const CRL_MAX_BYTES = 10 * 1024 * 1024;
const CRL_TIMEOUT_MS = 10_000;

// pkijs.CertificateRevocationList.fromBER() calls asn1js.fromBER() with no
// options, so it inherits asn1js's default DoS-protection limits — notably
// maxNodes: 10000. Each revoked-certificate entry is ~3 ASN.1 nodes (SEQUENCE
// + serial INTEGER + revocationDate Time), so any CRL with more than ~3300
// entries silently fails to parse (a real case: an 8-year-old ICP-Brasil CRL
// with ~40000 entries hit this). Replicate pkijs's own fromBER logic
// (asn1js.fromBER -> `new Ctor({ schema })`, see pkijs's PkiObject.fromBER)
// with generous limits instead of using the convenience wrapper, which
// doesn't expose a way to override them.
function parseCrlBer(buffer: ArrayBuffer): pkijs.CertificateRevocationList {
  const asn1 = asn1js.fromBER(buffer, { maxNodes: 1_000_000, maxContentLength: CRL_MAX_BYTES });
  if (asn1.offset === -1) {
    throw new Error("Failed to parse CRL as ASN.1 (offset -1)");
  }
  return new pkijs.CertificateRevocationList({ schema: asn1.result });
}

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
      const crl = parseCrlBer(bytes);
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
    } catch (err) {
      console.error("[certificate-check] CRL fetch/parse failed:", url, err);
      // try the next distribution point, if any
    }
  }

  return { status: "unavailable", reason: "crlRequestFailed" };
}
