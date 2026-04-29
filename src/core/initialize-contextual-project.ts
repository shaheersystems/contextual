import fs from "fs";
import path from "path";
import ignore from "ignore";
import { getGitignorePatterns } from "../fs/gitignore.js";
import { buildTree } from "./project-tree.js";
import { renderProjectStructureMarkdown } from "./project-structure-markdown.js";

export function initializeContextualProject(root: string = process.cwd()): void {
  const patterns = getGitignorePatterns(root);
  const ig = ignore().add(patterns).add([".CONTEXTUAL/", ".CONTEXTUAL/**"]);

  const tree = buildTree(root, "", ig);

  const contextualDir = path.join(root, ".CONTEXTUAL");
  fs.mkdirSync(contextualDir, { recursive: true });

  const md = renderProjectStructureMarkdown(root, tree);
  const outPath = path.join(contextualDir, "project-structure.md");
  fs.writeFileSync(outPath, md, "utf8");
}
