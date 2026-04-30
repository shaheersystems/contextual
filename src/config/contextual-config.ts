import fs from "fs";
import path from "path";

export type ContextualLanguage = "typescript" | "javascript" | "python" | "json" | "markdown";

export type ContextualConfig = {
  include: string[];
  exclude: string[];
  output: string;
  languages: ContextualLanguage[] | null;
  maxFileSizeBytes: number;
  followSymlinks: boolean;
};

export const DEFAULT_CONFIG: ContextualConfig = {
  include: [],
  exclude: [],
  output: ".CONTEXTUAL/project-structure.md",
  languages: null,
  maxFileSizeBytes: 1024 * 1024,
  followSymlinks: false,
};

export type LoadedContextualConfig = {
  config: ContextualConfig;
  configPath?: string;
};

export function loadContextualConfig(root: string = process.cwd()): LoadedContextualConfig {
  const configPath = path.join(root, "contextual.config.json");
  if (!fs.existsSync(configPath)) return { config: DEFAULT_CONFIG };

  let parsed: unknown;
  try {
    const raw = fs.readFileSync(configPath, "utf8");
    parsed = JSON.parse(raw);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    throw new Error(`Failed to parse contextual config at ${configPath}: ${message}`);
  }

  const config = validateContextualConfig(parsed, { configPath });
  return { config, configPath };
}

type ValidateOptions = { configPath?: string };

export function validateContextualConfig(raw: unknown, opts: ValidateOptions = {}): ContextualConfig {
  const where = opts.configPath ? ` at ${opts.configPath}` : "";

  if (raw == null || typeof raw !== "object" || Array.isArray(raw)) {
    throw new Error(`Invalid contextual config${where}: expected an object.`);
  }

  const obj = raw as Record<string, unknown>;

  const include = readStringArray(obj, "include", where);
  const exclude = readStringArray(obj, "exclude", where);
  const output = readOptionalString(obj, "output", where) ?? DEFAULT_CONFIG.output;
  const maxFileSizeBytes = readOptionalPositiveInteger(obj, "maxFileSizeBytes", where) ?? DEFAULT_CONFIG.maxFileSizeBytes;
  const followSymlinks = readOptionalBoolean(obj, "followSymlinks", where) ?? DEFAULT_CONFIG.followSymlinks;
  const languages = readOptionalLanguages(obj, "languages", where);

  return {
    include: include ?? DEFAULT_CONFIG.include,
    exclude: exclude ?? DEFAULT_CONFIG.exclude,
    output,
    languages,
    maxFileSizeBytes,
    followSymlinks,
  };
}

function readOptionalString(obj: Record<string, unknown>, field: string, where: string): string | undefined {
  const v = obj[field];
  if (v === undefined) return undefined;
  if (typeof v !== "string") {
    throw new Error(`Invalid contextual config${where}: \`${field}\` must be a string.`);
  }
  const trimmed = v.trim();
  if (!trimmed) throw new Error(`Invalid contextual config${where}: \`${field}\` must not be empty.`);
  return trimmed;
}

function readOptionalBoolean(obj: Record<string, unknown>, field: string, where: string): boolean | undefined {
  const v = obj[field];
  if (v === undefined) return undefined;
  if (typeof v !== "boolean") {
    throw new Error(`Invalid contextual config${where}: \`${field}\` must be a boolean.`);
  }
  return v;
}

function readOptionalPositiveInteger(
  obj: Record<string, unknown>,
  field: string,
  where: string,
): number | undefined {
  const v = obj[field];
  if (v === undefined) return undefined;
  if (typeof v !== "number" || !Number.isFinite(v) || !Number.isInteger(v) || v <= 0) {
    throw new Error(`Invalid contextual config${where}: \`${field}\` must be a positive integer (bytes).`);
  }
  return v;
}

function readStringArray(
  obj: Record<string, unknown>,
  field: string,
  where: string,
): string[] | undefined {
  const v = obj[field];
  if (v === undefined) return undefined;
  if (!Array.isArray(v) || v.some((x) => typeof x !== "string")) {
    throw new Error(`Invalid contextual config${where}: \`${field}\` must be an array of strings.`);
  }
  return v.map((s) => s.trim()).filter(Boolean);
}

function readOptionalLanguages(
  obj: Record<string, unknown>,
  field: string,
  where: string,
): ContextualLanguage[] | null {
  const v = obj[field];
  if (v === undefined) return DEFAULT_CONFIG.languages;
  if (v === null) return null;
  if (!Array.isArray(v) || v.some((x) => typeof x !== "string")) {
    throw new Error(`Invalid contextual config${where}: \`${field}\` must be an array of strings or null.`);
  }

  const allowed: ContextualLanguage[] = ["typescript", "javascript", "python", "json", "markdown"];
  const normalized = v.map((s) => s.trim().toLowerCase()).filter(Boolean);
  const invalid = normalized.filter((s) => !allowed.includes(s as ContextualLanguage));
  if (invalid.length > 0) {
    throw new Error(
      `Invalid contextual config${where}: \`${field}\` contains unsupported values: ${invalid.join(
        ", ",
      )}. Allowed: ${allowed.join(", ")}.`,
    );
  }

  // Dedup while preserving order
  const out: ContextualLanguage[] = [];
  for (const lang of normalized as ContextualLanguage[]) {
    if (!out.includes(lang)) out.push(lang);
  }
  return out;
}

