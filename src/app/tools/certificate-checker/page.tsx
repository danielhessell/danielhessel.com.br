"use client";

import { type ReactNode, useRef, useState } from "react";
import { Upload, X } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { ToolLayout } from "@/components/tool-layout";
import { Panel } from "@/components/panel";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ErrorBanner } from "@/components/error-banner";
import { WarningBanner } from "@/components/warning-banner";
import { cn } from "@/lib/utils";
import type { CertificateCheckResponse, RevocationMode } from "@/lib/certificate-check-types";

function arrayBufferToBase64(buf: ArrayBuffer): string {
  const bytes = new Uint8Array(buf);
  let binary = "";
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary);
}

// Certificates come as either PEM text (readable, safe to decode as UTF-8)
// or a binary file — DER (.cer/.der) or a PKCS#12/PFX container (.pfx/.p12,
// possibly password-protected). Reading everything as bytes first and
// sniffing for a PEM header avoids corrupting binary files via .text().
function FileUploadButton({
  label,
  onFile,
}: {
  label: string;
  onFile: (bytes: ArrayBuffer, filename: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <>
      <Button
        type="button"
        variant="ghost"
        onClick={() => inputRef.current?.click()}
        className="h-7 px-2 text-xs"
      >
        <Upload size={13} />
        {label}
      </Button>
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        onChange={async (e) => {
          const file = e.target.files?.[0];
          if (!file) return;
          onFile(await file.arrayBuffer(), file.name);
          e.target.value = "";
        }}
      />
    </>
  );
}

type Tone = "green" | "red" | "amber" | "gray";

const TONE_CLASSES: Record<Tone, string> = {
  green: "bg-green-500/10 text-green-700 dark:text-green-400",
  red: "bg-red-500/10 text-red-700 dark:text-red-400",
  amber: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
  gray: "bg-muted text-foreground/60",
};

function Badge({ tone, children }: { tone: Tone; children: ReactNode }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
        TONE_CLASSES[tone],
      )}
    >
      {children}
    </span>
  );
}

function Field({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 py-1 text-sm">
      <span className="shrink-0 text-foreground/60">{label}</span>
      <span className="text-right font-mono text-xs break-all">{value}</span>
    </div>
  );
}

export default function CertificateCheckerPage() {
  const t = useTranslations("tools.certificateChecker");
  const tCommon = useTranslations("common");
  const locale = useLocale();

  const [pem, setPem] = useState("");
  const [fileBase64, setFileBase64] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<RevocationMode>("auto");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CertificateCheckResponse | null>(null);
  const [networkError, setNetworkError] = useState(false);

  function handleFile(bytes: ArrayBuffer, filename: string) {
    const text = new TextDecoder("utf-8", { fatal: false }).decode(bytes);
    if (text.trimStart().startsWith("-----BEGIN")) {
      setPem(text);
      setFileBase64(null);
      setFileName(null);
    } else {
      setPem("");
      setFileBase64(arrayBufferToBase64(bytes));
      setFileName(filename);
    }
    setResult(null);
  }

  function clearFile() {
    setFileBase64(null);
    setFileName(null);
    setPassword("");
  }

  async function handleCheck() {
    setLoading(true);
    setNetworkError(false);
    setResult(null);
    try {
      const body = fileBase64
        ? { fileBase64, password: password || undefined, mode }
        : { pem, mode };
      const res = await fetch("/api/certificate-check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data: CertificateCheckResponse = await res.json();
      setResult(data);
    } catch {
      setNetworkError(true);
    } finally {
      setLoading(false);
    }
  }

  function formatDate(iso: string) {
    return new Date(iso).toLocaleString(locale);
  }

  const cert = result?.ok ? result.certificate : null;
  const revocation = result?.ok ? result.revocation : null;

  const validityStatus: "expired" | "notYetValid" | "expiringSoon" | "valid" | null = cert
    ? cert.isExpired
      ? "expired"
      : cert.isNotYetValid
        ? "notYetValid"
        : cert.daysUntilExpiry <= 30
          ? "expiringSoon"
          : "valid"
    : null;

  const validityTone: Record<NonNullable<typeof validityStatus>, Tone> = {
    valid: "green",
    expiringSoon: "amber",
    expired: "red",
    notYetValid: "red",
  };

  const revocationTone: Record<string, Tone> = {
    good: "green",
    revoked: "red",
    unknown: "gray",
    unavailable: "gray",
  };

  return (
    <ToolLayout title={t("title")} description={t("description")}>
      <WarningBanner message={t("disclosureWarning")} />

      <Panel
        label={
          <span className="flex items-center gap-2">
            {t("inputLabel")}
            <FileUploadButton label={t("uploadButton")} onFile={handleFile} />
          </span>
        }
      >
        {fileName ? (
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between rounded-md border border-border px-3 py-2">
              <span className="truncate font-mono text-xs">{t("fileSelected", { name: fileName })}</span>
              <button
                type="button"
                onClick={clearFile}
                aria-label={t("clearFile")}
                className="flex h-5 w-5 shrink-0 items-center justify-center rounded text-foreground/40 hover:text-foreground"
              >
                <X size={13} />
              </button>
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t("passwordPlaceholder")}
              aria-label={t("passwordLabel")}
              className="h-9 rounded-md border border-border bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            />
          </div>
        ) : (
          <Textarea
            rows={10}
            value={pem}
            onChange={(e) => setPem(e.target.value)}
            placeholder={t("placeholder")}
          />
        )}
      </Panel>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium uppercase tracking-wide text-foreground/60">
            {t("mode.label")}
          </span>
          <div className="flex gap-1">
            {(["auto", "ocsp", "crl"] as const).map((m) => (
              <Button
                key={m}
                type="button"
                variant={mode === m ? "primary" : "secondary"}
                onClick={() => setMode(m)}
                className="h-8 px-3 text-xs"
              >
                {t(`mode.${m}`)}
              </Button>
            ))}
          </div>
        </div>
        <Button
          variant="primary"
          onClick={handleCheck}
          disabled={loading || (!pem.trim() && !fileBase64)}
        >
          {loading ? t("checking") : t("checkButton")}
        </Button>
      </div>

      {result && !result.ok && <ErrorBanner message={t(`errors.${result.errorCode}`)} />}
      {networkError && <ErrorBanner message={t("errors.networkError")} />}

      {cert && revocation && validityStatus && (
        <>
          <Panel label={t("validity.heading")}>
            <div className="flex flex-col divide-y divide-border/50">
              <div className="flex items-center justify-between py-1">
                <span className="text-sm text-foreground/60">{t("validity.heading")}</span>
                <Badge tone={validityTone[validityStatus]}>
                  {t(`validity.status.${validityStatus}`)}
                </Badge>
              </div>
              <Field label={t("validity.validFrom")} value={formatDate(cert.validFrom)} />
              <Field label={t("validity.validTo")} value={formatDate(cert.validTo)} />
              <Field label={t("validity.daysRemaining")} value={cert.daysUntilExpiry} />
            </div>
          </Panel>

          <Panel label={t("identity.heading")}>
            <div className="flex flex-col divide-y divide-border/50">
              <div className="py-1">
                <div className="text-sm text-foreground/60">{t("identity.subject")}</div>
                <div className="break-all font-mono text-xs">{cert.subject}</div>
              </div>
              <div className="py-1">
                <div className="text-sm text-foreground/60">{t("identity.issuer")}</div>
                <div className="break-all font-mono text-xs">{cert.issuer}</div>
              </div>
              <div className="py-1">
                <div className="text-sm text-foreground/60">{t("identity.subjectAltNames")}</div>
                {cert.subjectAltNames.length > 0 ? (
                  <ul className="font-mono text-xs">
                    {cert.subjectAltNames.map((san) => (
                      <li key={san} className="break-all">
                        {san}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-xs text-foreground/40">{t("identity.noSans")}</div>
                )}
              </div>
              <Field
                label={t("identity.selfSigned")}
                value={cert.isSelfSigned ? tCommon("yes") : tCommon("no")}
              />
            </div>
          </Panel>

          <Panel label={t("revocation.heading")}>
            <div className="flex flex-col gap-2 py-1">
              <Badge tone={revocationTone[revocation.status]}>
                {t(`revocation.status.${revocation.status}`)}
              </Badge>
              {revocation.status === "unavailable" ? (
                <p className="text-sm text-foreground/60">{t(`revocation.reason.${revocation.reason}`)}</p>
              ) : (
                <div className="flex flex-col divide-y divide-border/50">
                  <Field label={t("revocation.method")} value={t(`mode.${revocation.method}`)} />
                  <Field label={t("revocation.checkedVia")} value={revocation.checkedVia} />
                  <Field label={t("revocation.thisUpdate")} value={formatDate(revocation.thisUpdate)} />
                  {revocation.nextUpdate && (
                    <Field label={t("revocation.nextUpdate")} value={formatDate(revocation.nextUpdate)} />
                  )}
                  {revocation.revokedAt && (
                    <Field label={t("revocation.revokedAt")} value={formatDate(revocation.revokedAt)} />
                  )}
                </div>
              )}
            </div>
          </Panel>

          <Panel label={t("technicalDetails.heading")}>
            <div className="flex flex-col gap-3">
              <div className="flex flex-col divide-y divide-border/50">
                <Field label={t("technicalDetails.serialNumber")} value={cert.serialNumber} />
                <Field
                  label={t("technicalDetails.publicKeyAlgorithm")}
                  value={cert.publicKey.type ?? "-"}
                />
                {cert.publicKey.modulusLength && (
                  <Field
                    label={t("technicalDetails.publicKeySize")}
                    value={`${cert.publicKey.modulusLength} bits`}
                  />
                )}
                {cert.publicKey.namedCurve && (
                  <Field label={t("technicalDetails.publicKeyCurve")} value={cert.publicKey.namedCurve} />
                )}
                <Field
                  label={t("technicalDetails.keyUsage")}
                  value={cert.keyUsage.length > 0 ? cert.keyUsage.join(", ") : t("technicalDetails.noKeyUsage")}
                />
                <Field
                  label={t("technicalDetails.isCa")}
                  value={cert.isCa ? tCommon("yes") : tCommon("no")}
                />
              </div>
              <Panel label={t("technicalDetails.fingerprintSha1")} copyValue={cert.fingerprintSha1}>
                <Textarea rows={1} readOnly value={cert.fingerprintSha1} />
              </Panel>
              <Panel label={t("technicalDetails.fingerprintSha256")} copyValue={cert.fingerprintSha256}>
                <Textarea rows={1} readOnly value={cert.fingerprintSha256} />
              </Panel>
              <Panel label={t("technicalDetails.fingerprintSha512")} copyValue={cert.fingerprintSha512}>
                <Textarea rows={1} readOnly value={cert.fingerprintSha512} />
              </Panel>
            </div>
          </Panel>
        </>
      )}
    </ToolLayout>
  );
}
