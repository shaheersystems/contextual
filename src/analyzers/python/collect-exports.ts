function stripPythonCommentsPreserveStrings(input: string): string {
  let out = "";
  let i = 0;

  type Mode = "normal" | "single" | "double" | "tripleSingle" | "tripleDouble";
  let mode: Mode = "normal";

  while (i < input.length) {
    const ch = input[i]!;
    const next2 = input.slice(i, i + 3);

    if (mode === "normal") {
      if (next2 === "'''") {
        mode = "tripleSingle";
        out += "'''";
        i += 3;
        continue;
      }
      if (next2 === '"""') {
        mode = "tripleDouble";
        out += '"""';
        i += 3;
        continue;
      }
      if (ch === "'") {
        mode = "single";
        out += ch;
        i += 1;
        continue;
      }
      if (ch === '"') {
        mode = "double";
        out += ch;
        i += 1;
        continue;
      }

      if (ch === "#") {
        while (i < input.length && input[i] !== "\n") {
          out += " ";
          i += 1;
        }
        continue;
      }

      out += ch;
      i += 1;
      continue;
    }

    out += ch;

    if (ch === "\\") {
      if (i + 1 < input.length) {
        out += input[i + 1]!;
        i += 2;
        continue;
      }
    }

    if (mode === "single" && ch === "'") mode = "normal";
    else if (mode === "double" && ch === '"') mode = "normal";
    else if (mode === "tripleSingle" && next2 === "'''") {
      out += "''";
      i += 3;
      mode = "normal";
      continue;
    } else if (mode === "tripleDouble" && next2 === '"""') {
      out += '""';
      i += 3;
      mode = "normal";
      continue;
    }

    i += 1;
  }

  return out;
}

function addUnique(results: string[], seen: Set<string>, value: string): void {
  const v = value.trim();
  if (!v) return;
  if (seen.has(v)) return;
  seen.add(v);
  results.push(v);
}

/**
 * Best-effort Python "exports" collection.
 *
 * Treat top-level (non-indented) `def` and `class` names as exports.
 * Excludes private names (starting with `_`).
 */
export function collectPythonExports(content: string): string[] {
  if (!content) return [];

  const stripped = stripPythonCommentsPreserveStrings(content);
  const results: string[] = [];
  const seen = new Set<string>();

  const lines = stripped.split(/\r?\n/u);
  for (const line of lines) {
    // Top-level only (no leading indentation)
    if (/^[ \t]+/u.test(line)) continue;
    const trimmed = line.trim();
    if (!trimmed) continue;

    const defMatch = /^def\s+([A-Za-z_][A-Za-z0-9_]*)\s*\(/u.exec(trimmed);
    if (defMatch?.[1] && !defMatch[1].startsWith("_")) {
      addUnique(results, seen, defMatch[1]);
      continue;
    }

    const classMatch = /^class\s+([A-Za-z_][A-Za-z0-9_]*)\b/u.exec(trimmed);
    if (classMatch?.[1] && !classMatch[1].startsWith("_")) {
      addUnique(results, seen, classMatch[1]);
    }
  }

  return results;
}

