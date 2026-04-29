import type { Command } from "commander";

export function registerHelloCommand(program: Command) {
  program
    .command("/hello [name] [language]")
    .description("Print a greeting")
    .action((name?: string, language?: string) => {
      const resolvedName = (name ?? "world").trim() || "world";
      const resolvedLanguage = (language ?? "en").trim() || "en";
      // eslint-disable-next-line no-console
      console.log(`Hello, ${resolvedName}! in ${resolvedLanguage}`);
    });
}

