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

function addUnique(results: string[], seen: Set<string>, name: string): void {
  const normalized = name.trim();
  if (!normalized) return;
  if (seen.has(normalized)) return;
  seen.add(normalized);
  results.push(normalized);
}

function parseExportList(spec: string): string[] {
  // spec contains the inside of `{ ... }`
  return spec
    .split(",")
    .map((p) => p.trim())
    .filter(Boolean)
    .map((part) => {
      // `a as b` => export name is `b`
      const asMatch = /\bas\b/u.test(part) ? part.split(/\bas\b/u) : null;
      if (asMatch && asMatch.length >= 2) return asMatch[1]!.trim();
      return part;
    })
    .map((part) => {
      // `default as Foo` => export name is `Foo`
      const m = /^default\s+as\s+(.+)$/u.exec(part);
      return m ? m[1]!.trim() : part;
    })
    .filter(Boolean);
}

/**
 * Collect unique exported names from ESM exports.
 *
 * Includes:
 * - `export default ...` => "default"
 * - `export const foo ...` => "foo" (also function/class/enum/type/interface)
 * - `export { a, b as c }` => "a", "c"
 * - `export { x } from "mod"` => "x"
 *
 * Notes:
 * - `export * from "mod"` does not declare local names, so it is ignored.
 */
export function collectExports(content: string, fileNameOrPath?: string): string[] {
  if (fileNameOrPath && !isJsTsFile(fileNameOrPath)) return [];
  if (!content) return [];

  const stripped = stripCommentsPreserveStrings(content);

  const results: string[] = [];
  const seen = new Set<string>();

  // export default ...
  const defaultRe = /(^|[;\r\n])\s*export\s+default\b/gm;
  if (defaultRe.test(stripped)) addUnique(results, seen, "default");

  // export (const|let|var|function|class|enum) name
  const declRe =
    /(^|[;\r\n])\s*export\s+(?:declare\s+)?(?:async\s+)?(?:const|let|var|function|class|enum)\s+(?<name>[$A-Z_a-z][0-9A-Z_a-z$]*)/gm;
  for (const m of stripped.matchAll(declRe)) {
    addUnique(results, seen, m.groups?.name ?? "");
  }

  // export (type|interface) Name
  const typeDeclRe =
    /(^|[;\r\n])\s*export\s+(?:declare\s+)?(?:type|interface)\s+(?<name>[$A-Z_a-z][0-9A-Z_a-z$]*)/gm;
  for (const m of stripped.matchAll(typeDeclRe)) {
    addUnique(results, seen, m.groups?.name ?? "");
  }

  // export { ... } [from "x"]
  const listRe = /(^|[;\r\n])\s*export\s+(?:type\s+)?\{(?<spec>[\s\S]*?)\}\s*(?:from\s*(['"])[^'"\r\n]+\2)?/gm;
  for (const m of stripped.matchAll(listRe)) {
    const spec = (m.groups?.spec ?? "").trim();
    if (!spec) continue;
    for (const name of parseExportList(spec)) addUnique(results, seen, name);
  }

  return results;
}

