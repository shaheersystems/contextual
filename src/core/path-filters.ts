import path from "path";
import picomatch from "picomatch";
import type { ContextualLanguage } from "../config/contextual-config.js";
import type { TreeNode } from "./project-tree.js";

type Matcher = (relativePosixPath: string) => boolean;

function compileGlobMatcher(patterns: string[] | undefined): Matcher | null {
  const cleaned = (patterns ?? []).map((p) => p.trim()).filter(Boolean);
  if (cleaned.length === 0) return null;

  const isMatch = picomatch(cleaned, { dot: true });
  return (relativePosixPath: string) => isMatch(relativePosixPath);
}

export function createIncludeExcludeMatcher(include: string[], exclude: string[]) {
  const includeMatch = compileGlobMatcher(include);
  const excludeMatch = compileGlobMatcher(exclude);

  return (relativePosixPath: string): boolean => {
    if (includeMatch && !includeMatch(relativePosixPath)) return false;
    if (excludeMatch && excludeMatch(relativePosixPath)) return false;
    return true;
  };
}

export function matchesLanguageGroup(filePath: string, languages: ContextualLanguage[] | null): boolean {
  if (!languages || languages.length === 0) return true;

  const lower = filePath.trim().toLowerCase();
  const ext = path.extname(lower);

  const group: ContextualLanguage | null =
    lower.endsWith(".d.ts") ? "typescript" : extToLanguageGroup(ext);

  if (!group) return false;
  return languages.includes(group);
}

function extToLanguageGroup(ext: string): ContextualLanguage | null {
  switch (ext) {
    case ".ts":
    case ".tsx":
      return "typescript";
    case ".js":
    case ".jsx":
    case ".mjs":
    case ".cjs":
      return "javascript";
    case ".py":
      return "python";
    case ".json":
    case ".jsonc":
      return "json";
    case ".md":
    case ".mdx":
      return "markdown";
    default:
      return null;
  }
}

export function pruneTree(
  nodes: TreeNode[],
  shouldKeepPath: (relativePosixPath: string) => boolean,
  shouldKeepFile: (relativePosixPath: string) => boolean,
): TreeNode[] {
  const out: TreeNode[] = [];
  for (const node of nodes) {
    const relPosix = node.relativePathFromRoot.replace(/\\/gu, "/");

    if (!shouldKeepPath(relPosix)) continue;

    if (node.type === "file") {
      if (!shouldKeepFile(relPosix)) continue;
      out.push(node);
      continue;
    }

    const prunedChildren = pruneTree(node.children ?? [], shouldKeepPath, shouldKeepFile);
    if (prunedChildren.length === 0) continue;

    out.push({ ...node, children: prunedChildren });
  }
  return out;
}

