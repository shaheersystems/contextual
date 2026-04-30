import fs from "fs";
import path from "path";
import ignore from "ignore";
import { loadContextualConfig } from "../config/contextual-config.js";
import { getGitignorePatterns } from "../fs/gitignore.js";
import { buildTree } from "./project-tree.js";
import { createIncludeExcludeMatcher, matchesLanguageGroup, pruneTree } from "./path-filters.js";
import { renderProjectStructureMarkdown } from "./project-structure-markdown.js";

export function initializeContextualProject(root: string = process.cwd()): void {
  const { config } = loadContextualConfig(root);

  const patterns = getGitignorePatterns(root);
  const ig = ignore().add(patterns).add([".CONTEXTUAL/", ".CONTEXTUAL/**"]);

  const tree = buildTree(root, "", ig, { followSymlinks: config.followSymlinks });

  const includeExclude = createIncludeExcludeMatcher(config.include, config.exclude);
  const pruned = pruneTree(
    tree,
    (relPosix) => includeExclude(relPosix),
    (relPosix) => includeExclude(relPosix) && matchesLanguageGroup(relPosix, config.languages),
  );

  const outPath = path.join(root, config.output);
  fs.mkdirSync(path.dirname(outPath), { recursive: true });

  const md = renderProjectStructureMarkdown(root, pruned, { maxFileSizeBytes: config.maxFileSizeBytes });
  fs.writeFileSync(outPath, md, "utf8");
}
