import { collectExports } from "../analyzers/javascript/collect-exports.js";
import { collectImports } from "../analyzers/javascript/collect-imports.js";
import { collectPythonExports } from "../analyzers/python/collect-exports.js";
import { collectPythonImports } from "../analyzers/python/collect-imports.js";
import { collectTopLevelKeys } from "../analyzers/structured-data/collect-top-level-keys.js";
import { identifyLanguage } from "./identify-language.js";

export type FileMetadata = {
  imports: string[];
  exports: string[];
  keys: string[];
};

export function collectMetadataForFile(content: string, absolutePath: string): FileMetadata {
  const lower = absolutePath.trim().toLowerCase();
  const language = identifyLanguage(absolutePath);

  if (lower.endsWith(".py") || language === "Python") {
    return {
      imports: collectPythonImports(content),
      exports: collectPythonExports(content),
      keys: [],
    };
  }

  if (lower.endsWith(".json") || lower.endsWith(".jsonc") || language.startsWith("JSON")) {
    return { imports: [], exports: [], keys: collectTopLevelKeys(content, "json") };
  }

  if (lower.endsWith(".yml") || lower.endsWith(".yaml") || language === "YAML") {
    return { imports: [], exports: [], keys: collectTopLevelKeys(content, "yaml") };
  }

  return {
    imports: collectImports(content, absolutePath),
    exports: collectExports(content, absolutePath),
    keys: [],
  };
}

export function buildShortDescription(metadata: FileMetadata): string {
  const exportsOrKeys = metadata.exports.length > 0 ? metadata.exports : metadata.keys;
  const pieces: string[] = [];

  if (exportsOrKeys.length > 0) {
    pieces.push(`Exports: ${truncateList(exportsOrKeys, 6)}`);
  }
  if (metadata.imports.length > 0) {
    pieces.push(`Uses: ${truncateList(metadata.imports, 6)}`);
  }

  if (pieces.length === 0) return "No explicit imports/exports detected.";
  return pieces.join(". ");
}

function truncateList(items: string[], max: number): string {
  if (items.length <= max) return items.join(", ");
  const head = items.slice(0, max).join(", ");
  return `${head} +${items.length - max} more`;
}
