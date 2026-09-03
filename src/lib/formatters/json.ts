export type FormatResult =
  | { ok: true; value: string }
  | { ok: false; error: string };

export function formatJson(input: string, indent = 2): FormatResult {
  try {
    const parsed = JSON.parse(input);
    return { ok: true, value: JSON.stringify(parsed, null, indent) };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

export function minifyJson(input: string): FormatResult {
  try {
    const parsed = JSON.parse(input);
    return { ok: true, value: JSON.stringify(parsed) };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}
