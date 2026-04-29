import type { Command } from "commander";
import fs from "fs";

export function registerDirectoryScanCommand(program: Command) {
  program
    .command("/directory-scan [directory]")
    .description("Scan a directory for files")
    .action((directory?: string) => {
      const resolvedDirectory = (directory ?? ".").trim() || ".";
      console.log(`Scanning directory: ${resolvedDirectory}`);
      const files = fs.readdirSync(resolvedDirectory);
      console.log(`Found ${files.length} files: ${files.join(", ")}`);
    });
}