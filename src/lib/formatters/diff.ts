import { diffLines, type Change } from "diff";

// A trailing newline present on one side only (e.g. an uploaded file that
// ends with "\n" vs. pasted text that doesn't) makes jsdiff treat the last
// line as removed+added even when its content is identical — strip it from
// both sides so trailing-newline presence never affects the comparison.
function stripTrailingNewline(value: string): string {
  return value.replace(/\r?\n$/, "");
}

export function computeLineDiff(a: string, b: string): Change[] {
  return diffLines(stripTrailingNewline(a), stripTrailingNewline(b));
}

// jsdiff's `value` blocks keep the trailing "\n" of each line, so a naive
// split leaves a bogus empty string at the end — drop it, but only that one.
export function splitLines(value: string): string[] {
  const lines = value.split("\n");
  if (lines[lines.length - 1] === "") lines.pop();
  return lines;
}

export type DiffStats = { added: number; removed: number; unchanged: number };

export function diffStats(changes: Change[]): DiffStats {
  let added = 0;
  let removed = 0;
  let unchanged = 0;
  for (const change of changes) {
    const count = splitLines(change.value).length;
    if (change.added) added += count;
    else if (change.removed) removed += count;
    else unchanged += count;
  }
  return { added, removed, unchanged };
}

export type SideBySideRow = {
  left: string | null;
  leftChanged: boolean;
  right: string | null;
  rightChanged: boolean;
};

export function toSideBySideRows(changes: Change[]): SideBySideRow[] {
  const rows: SideBySideRow[] = [];
  let i = 0;

  while (i < changes.length) {
    const change = changes[i];

    if (!change.added && !change.removed) {
      for (const line of splitLines(change.value)) {
        rows.push({ left: line, leftChanged: false, right: line, rightChanged: false });
      }
      i++;
      continue;
    }

    if (change.removed) {
      const removedLines = splitLines(change.value);
      const next = changes[i + 1];

      if (next?.added) {
        const addedLines = splitLines(next.value);
        const max = Math.max(removedLines.length, addedLines.length);
        for (let j = 0; j < max; j++) {
          const left = j < removedLines.length ? removedLines[j] : null;
          const right = j < addedLines.length ? addedLines[j] : null;
          rows.push({ left, leftChanged: left !== null, right, rightChanged: right !== null });
        }
        i += 2;
        continue;
      }

      for (const line of removedLines) {
        rows.push({ left: line, leftChanged: true, right: null, rightChanged: false });
      }
      i++;
      continue;
    }

    // lone addition, not preceded by a removed block (already consumed above)
    for (const line of splitLines(change.value)) {
      rows.push({ left: null, leftChanged: false, right: line, rightChanged: true });
    }
    i++;
  }

  return rows;
}
