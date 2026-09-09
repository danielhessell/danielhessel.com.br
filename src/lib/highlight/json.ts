export type HighlightSegment = { text: string; className?: string };

const TOKEN_RE =
  /("(?:\\u[0-9a-fA-F]{4}|\\[^u]|[^\\"])*")(\s*:)?|\b(-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)\b|\b(true|false)\b|\b(null)\b|([{}[\],:])/g;

const KEY_CLASS = "text-sky-600 dark:text-sky-400";
const STRING_CLASS = "text-emerald-600 dark:text-emerald-400";
const NUMBER_CLASS = "text-amber-600 dark:text-amber-400";
const KEYWORD_CLASS = "text-purple-600 dark:text-purple-400";
const PUNCTUATION_CLASS = "text-foreground/50";

export function highlightJson(source: string): HighlightSegment[] {
  const segments: HighlightSegment[] = [];
  let lastIndex = 0;

  for (const match of source.matchAll(TOKEN_RE)) {
    const index = match.index ?? 0;
    if (index > lastIndex) {
      segments.push({ text: source.slice(lastIndex, index) });
    }

    const [, stringToken, colonToken, numberToken, boolToken, nullToken, punctuationToken] = match;

    if (stringToken !== undefined) {
      segments.push({
        text: stringToken,
        className: colonToken !== undefined ? KEY_CLASS : STRING_CLASS,
      });
      if (colonToken !== undefined) {
        segments.push({ text: colonToken, className: PUNCTUATION_CLASS });
      }
    } else if (numberToken !== undefined) {
      segments.push({ text: numberToken, className: NUMBER_CLASS });
    } else if (boolToken !== undefined) {
      segments.push({ text: boolToken, className: KEYWORD_CLASS });
    } else if (nullToken !== undefined) {
      segments.push({ text: nullToken, className: KEYWORD_CLASS });
    } else if (punctuationToken !== undefined) {
      segments.push({ text: punctuationToken, className: PUNCTUATION_CLASS });
    }

    lastIndex = index + match[0].length;
  }

  if (lastIndex < source.length) {
    segments.push({ text: source.slice(lastIndex) });
  }

  return segments;
}
