function splitWords(input: string): string[] {
  return input
    .trim()
    .split(/[\s_-]+|(?<=[a-z0-9])(?=[A-Z])/)
    .filter(Boolean)
    .map((w) => w.toLowerCase());
}

export function toUpperCase(input: string) {
  return input.toUpperCase();
}

export function toLowerCase(input: string) {
  return input.toLowerCase();
}

export function toTitleCase(input: string) {
  return splitWords(input)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export function toCamelCase(input: string) {
  const words = splitWords(input);
  return words
    .map((w, i) => (i === 0 ? w : w.charAt(0).toUpperCase() + w.slice(1)))
    .join("");
}

export function toPascalCase(input: string) {
  return splitWords(input)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join("");
}

export function toSnakeCase(input: string) {
  return splitWords(input).join("_");
}

export function toKebabCase(input: string) {
  return splitWords(input).join("-");
}

export const caseConverters = {
  upper: toUpperCase,
  lower: toLowerCase,
  title: toTitleCase,
  camel: toCamelCase,
  pascal: toPascalCase,
  snake: toSnakeCase,
  kebab: toKebabCase,
} as const;

export type CaseKind = keyof typeof caseConverters;
