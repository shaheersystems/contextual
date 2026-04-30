import fs from "fs";
import path from "path";
import { toPosixPath } from "../fs/path.js";

export type TreeNode = {
  name: string;
  relativePathFromRoot: string;
  type: "file" | "dir";
  children?: TreeNode[];
};

type IgnoreMatcher = {
  ignores(pathname: string): boolean;
};

export type BuildTreeOptions = {
  followSymlinks?: boolean;
  /** Used internally to avoid symlink cycles */
  _seenRealDirs?: Set<string>;
};

export function buildTree(
  absoluteDirectory: string,
  relativeDirectoryFromRoot: string,
  ig: IgnoreMatcher,
  opts: BuildTreeOptions = {},
): TreeNode[] {
  const entries = fs.readdirSync(absoluteDirectory, { withFileTypes: true });

  const followSymlinks = Boolean(opts.followSymlinks);
  const seenRealDirs = opts._seenRealDirs ?? new Set<string>();

  if (followSymlinks) {
    try {
      const real = fs.realpathSync(absoluteDirectory);
      if (seenRealDirs.has(real)) return [];
      seenRealDirs.add(real);
    } catch {
      // If we can't resolve realpath, proceed best-effort.
    }
  }

  const nodes: TreeNode[] = [];
  for (const entry of entries) {
    const entryAbs = path.join(absoluteDirectory, entry.name);
    const entryRel = relativeDirectoryFromRoot
      ? path.join(relativeDirectoryFromRoot, entry.name)
      : entry.name;

    const entryRelForIgnore = toPosixPath(entryRel);
    if (ig.ignores(entryRelForIgnore)) continue;

    if (entry.isSymbolicLink()) {
      if (!followSymlinks) continue;
      let stat: fs.Stats;
      try {
        stat = fs.statSync(entryAbs);
      } catch {
        continue;
      }

      if (stat.isDirectory()) {
        const children = buildTree(entryAbs, entryRel, ig, { ...opts, _seenRealDirs: seenRealDirs });
        nodes.push({ name: entry.name, relativePathFromRoot: entryRel, type: "dir", children });
      } else if (stat.isFile()) {
        nodes.push({ name: entry.name, relativePathFromRoot: entryRel, type: "file" });
      }
      continue;
    }

    if (entry.isDirectory()) {
      const children = buildTree(entryAbs, entryRel, ig, { ...opts, _seenRealDirs: seenRealDirs });
      nodes.push({ name: entry.name, relativePathFromRoot: entryRel, type: "dir", children });
      continue;
    }

    nodes.push({ name: entry.name, relativePathFromRoot: entryRel, type: "file" });
  }

  nodes.sort((a, b) => {
    if (a.type !== b.type) return a.type === "dir" ? -1 : 1;
    return a.name.localeCompare(b.name);
  });

  return nodes;
}

export function flattenFiles(nodes: TreeNode[]): TreeNode[] {
  const out: TreeNode[] = [];
  for (const node of nodes) {
    if (node.type === "file") out.push(node);
    else out.push(...flattenFiles(node.children ?? []));
  }
  return out;
}

export function renderTreeLines(nodes: TreeNode[], prefix: string = ""): string[] {
  const lines: string[] = [];

  nodes.forEach((node, idx) => {
    const isLast = idx === nodes.length - 1;
    const branch = isLast ? "\u2514\u2500\u2500 " : "\u251c\u2500\u2500 ";
    const nextPrefix = prefix + (isLast ? "    " : "\u2502   ");

    if (node.type === "dir") {
      lines.push(`${prefix}${branch}${node.name}/`);
      lines.push(...renderTreeLines(node.children ?? [], nextPrefix));
    } else {
      lines.push(`${prefix}${branch}${node.name}`);
    }
  });

  return lines;
}
