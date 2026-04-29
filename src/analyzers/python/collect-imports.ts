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
        // Consume until newline, preserving line structure.
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

    // In-string modes: keep content, handle escapes, and exit on terminator.
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
 * Best-effort Python import collection.
 *
 * Includes:
 * - `import a`
 * - `import a as b`
 * - `import a, b`
 * - `from a import b`
 *
 * Returns module-ish specifiers (e.g. `a`, `a.b`).
 */
export function collectPythonImports(content: string): string[] {
  if (!content) return [];

  const stripped = stripPythonCommentsPreserveStrings(content);
  const results: string[] = [];
  const seen = new Set<string>();

  const lines = stripped.split(/\r?\n/u);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    const fromMatch = /^from\s+([A-Za-z0-9_\.]+)\s+import\s+/u.exec(trimmed);
    if (fromMatch?.[1]) {
      addUnique(results, seen, fromMatch[1]);
      continue;
    }

    const importMatch = /^import\s+(.+)$/u.exec(trimmed);
    if (importMatch?.[1]) {
      const rest = importMatch[1];
      // Split on commas (simple best-effort), then take module segment before " as ".
      for (const part of rest.split(",")) {
        const base = part.trim().split(/\s+as\s+/u)[0]?.trim() ?? "";
        if (!base) continue;
        // Only keep module-like tokens.
        if (/^[A-Za-z0-9_\.]+$/u.test(base)) addUnique(results, seen, base);
      }
    }
  }

  return results;
}

