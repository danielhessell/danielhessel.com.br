import formatXml from "xml-formatter";
import type { FormatResult } from "@/lib/formatters/json";

export function formatXmlPretty(input: string): FormatResult {
  try {
    return { ok: true, value: formatXml(input, { indentation: "  " }) };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

export function minifyXml(input: string): FormatResult {
  try {
    return { ok: true, value: formatXml.minify(input) };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}
