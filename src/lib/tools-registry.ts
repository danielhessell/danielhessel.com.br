import {
  Binary,
  Braces,
  Code2,
  FileText,
  Fingerprint,
  GitCompare,
  Hash,
  KeyRound,
  Link2,
  Type,
  Clock,
  FileCode,
  ShieldCheck,
  Text,
  type LucideIcon,
} from "lucide-react";

export type Tool = {
  slug: string;
  messageKey: string;
  icon: LucideIcon;
};

export const tools: Tool[] = [
  { slug: "text-counter", messageKey: "textCounter", icon: Text },
  { slug: "json-formatter", messageKey: "jsonFormatter", icon: Braces },
  { slug: "xml-formatter", messageKey: "xmlFormatter", icon: FileCode },
  { slug: "markdown-previewer", messageKey: "markdownPreviewer", icon: FileText },
  { slug: "base64", messageKey: "base64", icon: Binary },
  { slug: "hex", messageKey: "hex", icon: Code2 },
  { slug: "case-converter", messageKey: "caseConverter", icon: Type },
  { slug: "timestamp", messageKey: "timestamp", icon: Clock },
  { slug: "uuid-generator", messageKey: "uuidGenerator", icon: Fingerprint },
  { slug: "url-encoder", messageKey: "urlEncoder", icon: Link2 },
  { slug: "jwt-decoder", messageKey: "jwtDecoder", icon: KeyRound },
  { slug: "hash-generator", messageKey: "hashGenerator", icon: Hash },
  { slug: "diff-checker", messageKey: "diffChecker", icon: GitCompare },
  { slug: "certificate-checker", messageKey: "certificateChecker", icon: ShieldCheck },
];

export function getTool(slug: string) {
  return tools.find((t) => t.slug === slug);
}
