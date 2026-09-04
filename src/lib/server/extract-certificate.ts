import { X509Certificate } from "node:crypto";
import forge from "node-forge";

// Accepts a raw uploaded certificate file that isn't PEM text: either a bare
// DER-encoded X.509 certificate (.cer/.der), or a PKCS#12/PFX container
// (.pfx/.p12, optionally password-protected) holding one or more
// certificates. Returns the leaf certificate as a Node X509Certificate, or
// null if neither shape could be parsed (wrong password, corrupt file, no
// certificate bag found, etc).
export function extractCertificateFromFile(
  bytes: Buffer,
  password: string | undefined,
): X509Certificate | null {
  // Try a bare DER certificate first — cheap, and Node's X509Certificate
  // constructor accepts DER directly.
  try {
    return new X509Certificate(bytes);
  } catch {
    // fall through to PKCS#12
  }

  try {
    const forgeBuffer = forge.util.createBuffer(bytes.toString("binary"));
    const asn1 = forge.asn1.fromDer(forgeBuffer);
    const p12 = forge.pkcs12.pkcs12FromAsn1(asn1, false, password ?? "");

    const certBags = p12.safeContents
      .flatMap((sc) => sc.safeBags)
      .filter((bag): bag is typeof bag & { cert: forge.pki.Certificate } => Boolean(bag.cert));

    if (certBags.length === 0) return null;

    // PKCS#12 files don't guarantee bag order, but the end-entity cert is
    // conventionally the first one written alongside the private key —
    // good enough for a v1 "check this certificate" tool. Extracting the
    // full chain is future work, not requested.
    const pem = forge.pki.certificateToPem(certBags[0].cert);
    return new X509Certificate(pem);
  } catch {
    return null;
  }
}
