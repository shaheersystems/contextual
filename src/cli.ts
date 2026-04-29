#!/usr/bin/env bun
import { Command } from "commander";
import { registerHelloCommand } from "./commands/hello.js";
import { registerDirectoryScanCommand } from "./commands/directory-scan.js";
import { registerInitCommand } from "./commands/init.js";
const program = new Command();

program
  .name("contextual")
  .description("Contextual CLI")
  .version("0.0.0");

registerHelloCommand(program);
registerDirectoryScanCommand(program);
registerInitCommand(program);
await program.parseAsync(process.argv);

