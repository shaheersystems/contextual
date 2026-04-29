import fs from "fs";
import path from "path";


export function findNearestGitignorePath(startDirectory: string = process.cwd()): string | null {
  let current = path.resolve(startDirectory);
  const root = path.parse(current).root;

  while (true) {
    const candidate = path.join(current, ".gitignore");
    if (fs.existsSync(candidate)) return candidate;
    if (current === root) return null;
    current = path.dirname(current);
  }
}

export function getGitignoreContents(directory: string = process.cwd()): string {
  const gitignorePath = findNearestGitignorePath(directory);
  return gitignorePath ? fs.readFileSync(gitignorePath, "utf8") : "";
}

function parseGitignoreLine(rawLine: string): string | null {
  const line = rawLine.trim();
  if (!line) return null;

  if (line.startsWith("\\#")) return line.slice(1);
  if (line.startsWith("\\!")) return line.slice(1);
  if (line.startsWith("#")) return null;

  return line;
}

export function getGitignorePatterns(directory: string = process.cwd()): string[] {
  const contents = getGitignoreContents(directory);
  return contents
    .split(/\r?\n/u)
    .map(parseGitignoreLine)
    .filter((line): line is string => Boolean(line));
}