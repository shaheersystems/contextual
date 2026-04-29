#!/usr/bin/env bun
import { Command } from "commander";
import { registerHelloCommand } from "./commands/hello.js";
import { registerDirectoryScanCommand } from "./commands/directory-scan.js";
import { registerFileDiscoveryCommand } from "./commands/file-discovery.js";
const program = new Command();

program
  .name("contextual")
  .description("Contextual CLI")
  .version("0.0.0");

registerHelloCommand(program);
registerDirectoryScanCommand(program);
registerFileDiscoveryCommand(program);
await program.parseAsync(process.argv);

