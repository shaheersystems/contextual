#!/usr/bin/env bun
import { Command } from "commander";
import { registerInitCommand } from "./commands/init.js";
const program = new Command();

program
  .name("contextual")
  .description("Contextual CLI")
  .version("0.0.0");

registerInitCommand(program);
await program.parseAsync(process.argv);

