import path from "path";

const EXT_TO_LANGUAGE: Record<string, string> = {
  // JS/TS
  ".ts": "TypeScript",
  ".tsx": "TypeScript React",
  ".js": "JavaScript",
  ".jsx": "JavaScript React",
  ".mjs": "JavaScript",
  ".cjs": "JavaScript",

  // Data / config
  ".json": "JSON",
  ".jsonc": "JSON with Comments",
  ".yml": "YAML",
  ".yaml": "YAML",
  ".toml": "TOML",

  // Markup / docs
  ".md": "Markdown",
  ".mdx": "MDX",
  ".html": "HTML",
  ".htm": "HTML",

  // Styles
  ".css": "CSS",
  ".scss": "SCSS",
  ".sass": "Sass",
  ".less": "Less",

  // Common tooling
  ".graphql": "GraphQL",
  ".gql": "GraphQL",

  // Scripting
  ".py": "Python",
  ".rb": "Ruby",
  ".php": "PHP",
  ".go": "Go",
  ".rs": "Rust",
  ".java": "Java",
  ".kt": "Kotlin",
  ".swift": "Swift",

  // Shell / infra
  ".sh": "Shell",
  ".bash": "Shell",
  ".ps1": "PowerShell",
  ".dockerfile": "Dockerfile",
};

function normalizeName(fileNameOrPath: string): string {
  const base = path.basename(fileNameOrPath ?? "");
  return base.trim().toLowerCase();
}

function detectSpecialCases(normalizedBaseName: string): string | null {
  if (!normalizedBaseName) return null;

  // Multi-part extensions
  if (normalizedBaseName.endsWith(".d.ts")) return "TypeScript";

  // Common no-extension filenames
  if (normalizedBaseName === "dockerfile") return "Dockerfile";
  if (normalizedBaseName === "makefile") return "Makefile";

  return null;
}

export function identifyLanguage(fileNameOrPath: string): string {
  const normalized = normalizeName(fileNameOrPath);

  const special = detectSpecialCases(normalized);
  if (special) return special;

  const ext = path.extname(normalized);
  if (!ext) return "text";

  return EXT_TO_LANGUAGE[ext] ?? "text";
}
