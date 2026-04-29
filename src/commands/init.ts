import type { Command } from "commander";
import fs from "fs";
import path from "path";
import ignore from "ignore";
import { getGitignorePatterns } from "../helpers/find-gitignore.js";
import { identifyLanguage } from "../helpers/identify-language.js";
import { collectImports } from "../helpers/collect-imports.js";
import { collectExports } from "../helpers/collect-exports.js";
import { collectPythonImports } from "../helpers/collect-python-imports.js";
import { collectPythonExports } from "../helpers/collect-python-exports.js";
import { collectTopLevelKeys } from "../helpers/collect-top-level-keys.js";

type TreeNode = {
  name: string;
  relativePathFromRoot: string;
  type: "file" | "dir";
  children?: TreeNode[];
};

function toPosixPath(p: string): string {
  return p.split(path.sep).join("/");
}

function buildTree(
  absoluteDirectory: string,
  relativeDirectoryFromRoot: string,
  ig: ReturnType<typeof ignore>,
): TreeNode[] {
  const entries = fs.readdirSync(absoluteDirectory, { withFileTypes: true });

  const nodes: TreeNode[] = [];
  for (const entry of entries) {
    const entryAbs = path.join(absoluteDirectory, entry.name);
    const entryRel = relativeDirectoryFromRoot
      ? path.join(relativeDirectoryFromRoot, entry.name)
      : entry.name;

    const entryRelForIgnore = toPosixPath(entryRel);
    if (ig.ignores(entryRelForIgnore)) continue;

    if (entry.isDirectory()) {
      const children = buildTree(entryAbs, entryRel, ig);
      nodes.push({
        name: entry.name,
        relativePathFromRoot: entryRel,
        type: "dir",
        children,
      });
    } else {
      nodes.push({ name: entry.name, relativePathFromRoot: entryRel, type: "file" });
    }
  }

  nodes.sort((a, b) => {
    if (a.type !== b.type) return a.type === "dir" ? -1 : 1;
    return a.name.localeCompare(b.name);
  });

  return nodes;
}

function flattenFiles(nodes: TreeNode[]): TreeNode[] {
  const out: TreeNode[] = [];
  for (const node of nodes) {
    if (node.type === "file") out.push(node);
    else out.push(...flattenFiles(node.children ?? []));
  }
  return out;
}

function renderTreeLines(nodes: TreeNode[], prefix: string = ""): string[] {
  const lines: string[] = [];

  nodes.forEach((node, idx) => {
    const isLast = idx === nodes.length - 1;
    const branch = isLast ? "└── " : "├── ";
    const nextPrefix = prefix + (isLast ? "    " : "│   ");

    if (node.type === "dir") {
      lines.push(`${prefix}${branch}${node.name}/`);
      lines.push(...renderTreeLines(node.children ?? [], nextPrefix));
    } else {
      lines.push(`${prefix}${branch}${node.name}`);
    }
  });

  return lines;
}

function truncateList(items: string[], max: number): string {
  if (items.length <= max) return items.join(", ");
  const head = items.slice(0, max).join(", ");
  return `${head} +${items.length - max} more`;
}

function buildShortDescription(args: {
  imports: string[];
  exports: string[];
  keys: string[];
}): string {
  const exportsOrKeys = args.exports.length > 0 ? args.exports : args.keys;
  const pieces: string[] = [];

  if (exportsOrKeys.length > 0) pieces.push(`Exports: ${truncateList(exportsOrKeys, 6)}`);
  if (args.imports.length > 0) pieces.push(`Uses: ${truncateList(args.imports, 6)}`);

  if (pieces.length === 0) return "No explicit imports/exports detected.";
  return pieces.join(". ");
}

function isProbablyBinary(buf: Buffer): boolean {
  // Heuristic: presence of NULL bytes is a strong signal.
  return buf.includes(0);
}

function readTextFileBestEffort(
  absolutePath: string,
  maxBytes: number,
): { content: string; skippedReason?: string } {
  let buf: Buffer;
  try {
    buf = fs.readFileSync(absolutePath);
  } catch {
    return { content: "", skippedReason: "unreadable" };
  }

  if (buf.byteLength > maxBytes) return { content: "", skippedReason: "too large" };
  if (isProbablyBinary(buf)) return { content: "", skippedReason: "binary" };

  try {
    return { content: buf.toString("utf8") };
  } catch {
    return { content: "", skippedReason: "unreadable" };
  }
}

function collectMetadataForFile(
  content: string,
  absolutePath: string,
): { imports: string[]; exports: string[]; keys: string[] } {
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

  // JS/TS (existing behavior)
  return {
    imports: collectImports(content, absolutePath),
    exports: collectExports(content, absolutePath),
    keys: [],
  };
}

function renderProjectStructureMarkdown(root: string, tree: TreeNode[]): string {
  const lines: string[] = [];
  lines.push("# Project structure");
  lines.push("");
  lines.push(`Generated from: \`${toPosixPath(root)}\``);
  lines.push("");

  lines.push("## Directory tree");
  lines.push("");
  lines.push("```");
  lines.push(".");
  lines.push(...renderTreeLines(tree));
  lines.push("```");
  lines.push("");

  lines.push("## File details");
  lines.push("");

  const files = flattenFiles(tree);
  const maxBytes = 1024 * 1024; // 1MB

  for (const file of files) {
    const relativePosix = toPosixPath(file.relativePathFromRoot);
    const absolutePath = path.join(root, file.relativePathFromRoot);
    const language = identifyLanguage(absolutePath);

    const { content, skippedReason } = readTextFileBestEffort(absolutePath, maxBytes);

    const { imports, exports, keys } = collectMetadataForFile(content, absolutePath);
    const description = skippedReason
      ? `Skipped (${skippedReason}).`
      : buildShortDescription({ imports, exports, keys });

    lines.push(`### ${relativePosix}`);
    lines.push("");
    lines.push(`- **Language**: ${language}`);
    lines.push(`- **Description**: ${description}`);

    if (imports.length > 0) lines.push(`- **Imports**: ${imports.join(", ")}`);
    else lines.push("- **Imports**: (none)");

    const exportsOrKeys = exports.length > 0 ? exports : keys;
    if (exportsOrKeys.length > 0) lines.push(`- **Exports**: ${exportsOrKeys.join(", ")}`);
    else lines.push("- **Exports**: (none)");

    lines.push("");
  }

  return lines.join("\n");
}

export function registerInitCommand(program: Command) {
  program
    .command("/init")
    .description("Initialize a new project")
    .action(() => {
      const root = process.cwd();
      const patterns = getGitignorePatterns(root);
      const ig = ignore().add(patterns).add([".CONTEXTUAL/", ".CONTEXTUAL/**"]);

      const tree = buildTree(root, "", ig);

      const contextualDir = path.join(root, ".CONTEXTUAL");
      fs.mkdirSync(contextualDir, { recursive: true });

      const md = renderProjectStructureMarkdown(root, tree);
      const outPath = path.join(contextualDir, "project-structure.md");
      fs.writeFileSync(outPath, md, "utf8");
    });
}