import Papa from "papaparse";

export type CsvJsonResult =
  | { ok: true; value: string }
  | { ok: false; errorCode: "invalidCsv" | "invalidJson" };

export function csvToJson(input: string): CsvJsonResult {
  const parsed = Papa.parse<Record<string, string>>(input.trim(), {
    header: true,
    skipEmptyLines: true,
  });
  if (parsed.errors.length > 0) {
    return { ok: false, errorCode: "invalidCsv" };
  }
  return { ok: true, value: JSON.stringify(parsed.data, null, 2) };
}

export function jsonToCsv(input: string): CsvJsonResult {
  let data: unknown;
  try {
    data = JSON.parse(input);
  } catch {
    return { ok: false, errorCode: "invalidJson" };
  }
  if (!Array.isArray(data)) {
    return { ok: false, errorCode: "invalidJson" };
  }
  try {
    return { ok: true, value: Papa.unparse(data) };
  } catch {
    return { ok: false, errorCode: "invalidJson" };
  }
}
