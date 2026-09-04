import { X509Certificate } from "node:crypto";
import forge from "node-forge";

// Some CAs (notably non-Web-PKI ones — government/corporate PKI providers
// like Brazil's ICP-Brasil hierarchy) answer the AIA "CA Issuers" URL with a
// "degenerate" PKCS#7 SignedData: a certs-only bundle with no actual
// signature, used purely as a container. Node's X509Certificate can't parse
// this directly. Returns the first certificate found, or null if the bytes
// aren't a PKCS#7 certs bundle either.
export function tryParsePkcs7Certificate(bytes: Buffer): X509Certificate | null {
  try {
    const asn1 = forge.asn1.fromDer(forge.util.createBuffer(bytes.toString("binary")));
    const msg = forge.pkcs7.messageFromAsn1(asn1);
    if (!("certificates" in msg) || msg.certificates.length === 0) return null;
    const pem = forge.pki.certificateToPem(msg.certificates[0]);
    return new X509Certificate(pem);
  } catch {
    return null;
  }
}
