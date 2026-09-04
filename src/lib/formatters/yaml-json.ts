import { load, dump } from "js-yaml";

export type YamlJsonResult =
  | { ok: true; value: string }
  | { ok: false; errorCode: "invalidYaml" | "invalidJson" };

export function yamlToJson(input: string): YamlJsonResult {
  try {
    const data = load(input);
    return { ok: true, value: JSON.stringify(data, null, 2) };
  } catch {
    return { ok: false, errorCode: "invalidYaml" };
  }
}

export function jsonToYaml(input: string): YamlJsonResult {
  let data: unknown;
  try {
    data = JSON.parse(input);
  } catch {
    return { ok: false, errorCode: "invalidJson" };
  }
  try {
    return { ok: true, value: dump(data) };
  } catch {
    return { ok: false, errorCode: "invalidJson" };
  }
}
