import path from "path";

function isJsTsFile(fileNameOrPath: string): boolean {
  const normalized = (fileNameOrPath ?? "").trim().toLowerCase();
  if (!normalized) return false;
  if (normalized.endsWith(".d.ts")) return true;

  const ext = path.extname(normalized);
  return (
    ext === ".js" ||
    ext === ".jsx" ||
    ext === ".mjs" ||
    ext === ".cjs" ||
    ext === ".ts" ||
    ext === ".tsx"
  );
}

function stripCommentsPreserveStrings(input: string): string {
  let out = "";
  let i = 0;

  type Mode = "normal" | "single" | "double" | "template" | "line" | "block";
  let mode: Mode = "normal";
  let escaped = false;

  while (i < input.length) {
    const ch = input[i]!;
    const next = i + 1 < input.length ? input[i + 1]! : "";

    if (mode === "normal") {
      if (ch === "'" || ch === '"' || ch === "`") {
        mode = ch === "'" ? "single" : ch === '"' ? "double" : "template";
        escaped = false;
        out += ch;
        i += 1;
        continue;
      }

      if (ch === "/" && next === "/") {
        mode = "line";
        out += "  ";
        i += 2;
        continue;
      }

      if (ch === "/" && next === "*") {
        mode = "block";
        out += "  ";
        i += 2;
        continue;
      }

      out += ch;
      i += 1;
      continue;
    }

    if (mode === "line") {
      if (ch === "\n") {
        mode = "normal";
        out += "\n";
        i += 1;
        continue;
      }
      out += " ";
      i += 1;
      continue;
    }

    if (mode === "block") {
      if (ch === "*" && next === "/") {
        mode = "normal";
        out += "  ";
        i += 2;
        continue;
      }
      out += ch === "\n" ? "\n" : " ";
      i += 1;
      continue;
    }

    // String modes
    out += ch;

    if (escaped) {
      escaped = false;
      i += 1;
      continue;
    }

    if (ch === "\\") {
      escaped = true;
      i += 1;
      continue;
    }

    if (mode === "single" && ch === "'") mode = "normal";
    else if (mode === "double" && ch === '"') mode = "normal";
    else if (mode === "template" && ch === "`") mode = "normal";

    i += 1;
  }

  return out;
}

/**
 * Collect unique module specifiers imported via static ESM imports.
 *
 * Includes:
 * - `import ... from "x"`
 * - `import "x"`
 *
 * Excludes:
 * - dynamic `import("x")`
 * - CommonJS `require("x")`
 */
export function collectImports(content: string, fileNameOrPath?: string): string[] {
  if (fileNameOrPath && !isJsTsFile(fileNameOrPath)) return [];
  if (!content) return [];

  const stripped = stripCommentsPreserveStrings(content);

  const hits: Array<{ index: number; src: string }> = [];

  // `import ... from "x"` (including `import type ... from "x"`)
  // - Avoid matching `import(` by requiring whitespace after `import`
  const fromRe =
    /(^|[;\r\n])\s*import\s+(?:type\s+)?(?:(?!\bimport\b)[\s\S])*?\sfrom\s*(['"])(?<src>[^'"\r\n]+)\2/gm;
  for (const match of stripped.matchAll(fromRe)) {
    const src = (match.groups?.src ?? "").trim();
    if (!src) continue;
    hits.push({ index: match.index ?? 0, src });
  }

  // Side-effect imports: `import "x"`
  const sideEffectRe =
    /(^|[;\r\n])\s*import\s*(['"])(?<src>[^'"\r\n]+)\2/gm;
  for (const match of stripped.matchAll(sideEffectRe)) {
    const src = (match.groups?.src ?? "").trim();
    if (!src) continue;
    hits.push({ index: match.index ?? 0, src });
  }

  hits.sort((a, b) => a.index - b.index);

  const results: string[] = [];
  const seen = new Set<string>();
  for (const hit of hits) {
    if (seen.has(hit.src)) continue;
    seen.add(hit.src);
    results.push(hit.src);
  }

  return results;
}
