import {
  Binary,
  Braces,
  Code2,
  FileText,
  Fingerprint,
  Hash,
  KeyRound,
  Link2,
  Type,
  Clock,
  FileCode,
  Text,
  type LucideIcon,
} from "lucide-react";

export type Tool = {
  slug: string;
  title: string;
  description: string;
  icon: LucideIcon;
};

export const tools: Tool[] = [
  {
    slug: "text-counter",
    title: "Text Counter",
    description: "Count characters, words and lines in text.",
    icon: Text,
  },
  {
    slug: "json-formatter",
    title: "JSON Formatter",
    description: "Pretty-print, minify and validate JSON.",
    icon: Braces,
  },
  {
    slug: "xml-formatter",
    title: "XML Formatter",
    description: "Pretty-print and minify XML.",
    icon: FileCode,
  },
  {
    slug: "markdown-previewer",
    title: "Markdown Previewer",
    description: "Live preview of Markdown, GitHub-flavored.",
    icon: FileText,
  },
  {
    slug: "base64",
    title: "Base64 Encode/Decode",
    description: "Convert text to and from Base64.",
    icon: Binary,
  },
  {
    slug: "hex",
    title: "Hex Encode/Decode",
    description: "Convert text to and from hexadecimal.",
    icon: Code2,
  },
  {
    slug: "case-converter",
    title: "Case Converter",
    description: "Switch between upper, lower, camel, snake, kebab case.",
    icon: Type,
  },
  {
    slug: "timestamp",
    title: "Timestamp Generator",
    description: "Current time in Unix, ISO, Java, Node, Python formats.",
    icon: Clock,
  },
  {
    slug: "uuid-generator",
    title: "UUID Generator",
    description: "Generate one or many UUID v4 values.",
    icon: Fingerprint,
  },
  {
    slug: "url-encoder",
    title: "URL Encode/Decode",
    description: "Encode and decode URI components.",
    icon: Link2,
  },
  {
    slug: "jwt-decoder",
    title: "JWT Decoder",
    description: "Decode a JWT's header and payload (no verification).",
    icon: KeyRound,
  },
  {
    slug: "hash-generator",
    title: "Hash Generator",
    description: "MD5, SHA-1 and SHA-256 of text.",
    icon: Hash,
  },
];

export function getTool(slug: string) {
  return tools.find((t) => t.slug === slug);
}
