import path from "path";
import { readTextFileBestEffort } from "../fs/read-text-file.js";
import { toPosixPath } from "../fs/path.js";
import { buildShortDescription, collectMetadataForFile } from "./file-metadata.js";
import { identifyLanguage } from "./identify-language.js";
import { flattenFiles, renderTreeLines, type TreeNode } from "./project-tree.js";

export function renderProjectStructureMarkdown(root: string, tree: TreeNode[]): string {
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
    const metadata = collectMetadataForFile(content, absolutePath);
    const description = skippedReason
      ? `Skipped (${skippedReason}).`
      : buildShortDescription(metadata);

    lines.push(`### ${relativePosix}`);
    lines.push("");
    lines.push(`- **Language**: ${language}`);
    lines.push(`- **Description**: ${description}`);

    if (metadata.imports.length > 0) lines.push(`- **Imports**: ${metadata.imports.join(", ")}`);
    else lines.push("- **Imports**: (none)");

    const exportsOrKeys = metadata.exports.length > 0 ? metadata.exports : metadata.keys;
    if (exportsOrKeys.length > 0) lines.push(`- **Exports**: ${exportsOrKeys.join(", ")}`);
    else lines.push("- **Exports**: (none)");

    lines.push("");
  }

  return lines.join("\n");
}
