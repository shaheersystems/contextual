import type { Command } from "commander";
import { initializeContextualProject } from "../core/initialize-contextual-project.js";

export function registerInitCommand(program: Command) {
  program
    .command("/init")
    .description("Initialize a new project")
    .action(() => {
      initializeContextualProject();
    });
}
