export type RevocationMode = "auto" | "ocsp" | "crl";

export type CertificateCheckRequest = { mode?: RevocationMode } & (
  | { pem: string }
  | { fileBase64: string; password?: string }
);

export type PublicKeyInfo = {
  type: string | undefined;
  modulusLength?: number;
  namedCurve?: string;
};

export type CertificateInfo = {
  subject: string;
  issuer: string;
  subjectAltNames: string[];
  validFrom: string;
  validTo: string;
  isExpired: boolean;
  isNotYetValid: boolean;
  daysUntilExpiry: number;
  serialNumber: string;
  fingerprintSha1: string;
  fingerprintSha256: string;
  fingerprintSha512: string;
  keyUsage: string[];
  isCa: boolean;
  isSelfSigned: boolean;
  publicKey: PublicKeyInfo;
  ocspUrl?: string;
  caIssuersUrl?: string;
};

export type RevocationInfo =
  | {
      status: "good" | "revoked" | "unknown";
      method: "ocsp" | "crl";
      thisUpdate: string;
      nextUpdate?: string;
      revokedAt?: string;
      checkedVia: string;
    }
  | {
      status: "unavailable";
      reason:
        | "noOcspUrl"
        | "ocspRequestFailed"
        | "issuerCertUnavailable"
        | "noCrlUrl"
        | "crlRequestFailed";
    };

export type CertificateCheckResponse =
  | { ok: true; certificate: CertificateInfo; revocation: RevocationInfo }
  | { ok: false; errorCode: "invalidPem" | "invalidPfx" | "unexpectedError" };
