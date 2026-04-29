import type { Command } from "commander";
import fs from "fs";
import path from "path";
import ignore from "ignore";
import { getGitignorePatterns } from "../helpers/find-gitignore.js";
import { identifyLanguage } from "../helpers/identify-language.js";
import { collectImports } from "../helpers/collect-imports.js";
import { collectExports } from "../helpers/collect-exports.js";

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

function printTree(root: string, nodes: TreeNode[], depth: number): void {
  const indent = "  ".repeat(depth);
  for (const node of nodes) {
    if (node.type === "dir") {
      // eslint-disable-next-line no-console
      console.log(`${indent}${node.name}/`);
      printTree(root, node.children ?? [], depth + 1);
    } else {
      const language = identifyLanguage(node.name);
      // eslint-disable-next-line no-console
      console.log(`${indent}${language} ${node.name}`);

      const absolutePath = path.join(root, node.relativePathFromRoot);
      let fileContents = "";
      try {
        fileContents = fs.readFileSync(absolutePath, "utf8");
      } catch {
        fileContents = "";
      }

      const imports = collectImports(fileContents, absolutePath);
      if (imports.length > 0) {
        // eslint-disable-next-line no-console
        console.log(`${indent}  imports: ${imports.join(", ")}`);
      }

      const exports = collectExports(fileContents, absolutePath);
      if (exports.length > 0) {
        // eslint-disable-next-line no-console
        console.log(`${indent}  exports: ${exports.join(", ")}`);
      }
    }
  }
}

export function registerFileDiscoveryCommand(program: Command) {
  program
    .command("/file-discovery")
    .description("Discover files in the current directory (recursive)")
    .action(() => {
      const root = process.cwd();
      const patterns = getGitignorePatterns(root);
      const ig = ignore().add(patterns);

      const tree = buildTree(root, "", ig);
      printTree(root, tree, 0);
    });
}