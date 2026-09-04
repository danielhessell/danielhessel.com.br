import type { X509Certificate } from "node:crypto";
import * as pkijs from "pkijs";

function toArrayBuffer(buf: Buffer): ArrayBuffer {
  return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength) as ArrayBuffer;
}

export function toPkijsCertificate(cert: X509Certificate): pkijs.Certificate {
  return pkijs.Certificate.fromBER(toArrayBuffer(cert.raw));
}
