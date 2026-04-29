function addUnique(results: string[], seen: Set<string>, value: string): void {
  const v = value.trim();
  if (!v) return;
  if (seen.has(v)) return;
  seen.add(v);
  results.push(v);
}

function collectJsonTopLevelKeys(content: string): string[] {
  if (!content) return [];
  try {
    const parsed = JSON.parse(content);
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      return Object.keys(parsed as Record<string, unknown>);
    }
  } catch {
    // best-effort: ignore parse errors
  }
  return [];
}

function stripYamlComments(input: string): string {
  const lines = input.split(/\r?\n/u);
  return lines
    .map((line) => {
      const trimmed = line.trim();
      if (!trimmed) return "";
      if (trimmed.startsWith("#")) return "";
      // Keep inline comments only when preceded by whitespace (best-effort).
      const hashIndex = line.indexOf("#");
      if (hashIndex === -1) return line;
      const before = line.slice(0, hashIndex);
      if (/\s$/u.test(before)) return before;
      return line;
    })
    .join("\n");
}

function collectYamlTopLevelKeys(content: string): string[] {
  if (!content) return [];
  const stripped = stripYamlComments(content);
  const results: string[] = [];
  const seen = new Set<string>();

  const lines = stripped.split(/\r?\n/u);
  for (const line of lines) {
    if (!line) continue;
    // Top-level only: no indentation
    if (/^[ \t]+/u.test(line)) continue;
    const trimmed = line.trim();
    if (!trimmed) continue;
    // Ignore list items like "- foo"
    if (trimmed.startsWith("-")) continue;

    // Match `key:` (allow quoted keys)
    const m =
      /^(?:"(?<dq>[^"]+)"|'(?<sq>[^']+)'|(?<plain>[A-Za-z0-9_.-]+))\s*:/u.exec(
        trimmed,
      );
    const key = (m?.groups?.dq ?? m?.groups?.sq ?? m?.groups?.plain ?? "").trim();
    if (!key) continue;
    addUnique(results, seen, key);
  }

  return results;
}

export type TopLevelKeyFormat = "json" | "yaml";

/**
 * Collect top-level keys for structured config formats.
 * - `json`: uses JSON.parse when possible
 * - `yaml`: conservative regex scan for non-indented `key:` lines
 */
export function collectTopLevelKeys(content: string, format: TopLevelKeyFormat): string[] {
  if (format === "json") return collectJsonTopLevelKeys(content);
  return collectYamlTopLevelKeys(content);
}

