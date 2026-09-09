import type { HighlightSegment } from "@/lib/highlight/json";

const TOKEN_RE =
  /(<!--[\s\S]*?-->)|(<\/?)([a-zA-Z_][\w:.-]*)|([\w:.-]+)(=)("[^"]*"|'[^']*')|(\/?>)/g;

const COMMENT_CLASS = "text-foreground/40 italic";
const TAG_NAME_CLASS = "text-sky-600 dark:text-sky-400";
const ATTRIBUTE_NAME_CLASS = "text-amber-600 dark:text-amber-400";
const ATTRIBUTE_VALUE_CLASS = "text-emerald-600 dark:text-emerald-400";
const PUNCTUATION_CLASS = "text-foreground/50";

export function highlightXml(source: string): HighlightSegment[] {
  const segments: HighlightSegment[] = [];
  let lastIndex = 0;

  for (const match of source.matchAll(TOKEN_RE)) {
    const index = match.index ?? 0;
    if (index > lastIndex) {
      segments.push({ text: source.slice(lastIndex, index) });
    }

    const [
      ,
      commentToken,
      tagOpenToken,
      tagNameToken,
      attributeNameToken,
      equalsToken,
      attributeValueToken,
      tagCloseToken,
    ] = match;

    if (commentToken !== undefined) {
      segments.push({ text: commentToken, className: COMMENT_CLASS });
    } else if (tagOpenToken !== undefined) {
      segments.push({ text: tagOpenToken, className: PUNCTUATION_CLASS });
      segments.push({ text: tagNameToken, className: TAG_NAME_CLASS });
    } else if (attributeNameToken !== undefined) {
      segments.push({ text: attributeNameToken, className: ATTRIBUTE_NAME_CLASS });
      segments.push({ text: equalsToken, className: PUNCTUATION_CLASS });
      segments.push({ text: attributeValueToken, className: ATTRIBUTE_VALUE_CLASS });
    } else if (tagCloseToken !== undefined) {
      segments.push({ text: tagCloseToken, className: PUNCTUATION_CLASS });
    }

    lastIndex = index + match[0].length;
  }

  if (lastIndex < source.length) {
    segments.push({ text: source.slice(lastIndex) });
  }

  return segments;
}
