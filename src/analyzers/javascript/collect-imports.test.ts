import { describe, expect, test } from "bun:test";
import { collectImports } from "./collect-imports.js";

describe("collectImports", () => {
  test("returns [] for non-js/ts extensions when fileNameOrPath is provided", () => {
    expect(collectImports('import "x";', "data.json")).toEqual([]);
  });

  test("collects sources from static `import ... from` statements", () => {
    const src = `
      import React from "react";
      import type { Foo } from "@acme/types";
      import { a, b as c } from "./utils";
      import * as ns from "../ns";
    `;
    expect(collectImports(src, "file.ts")).toEqual([
      "react",
      "@acme/types",
      "./utils",
      "../ns",
    ]);
  });

  test("collects side-effect imports", () => {
    const src = `
      import "reflect-metadata";
      import "./polyfills";
    `;
    expect(collectImports(src, "file.js")).toEqual(["reflect-metadata", "./polyfills"]);
  });

  test("handles multiline imports", () => {
    const src = `
      import {
        a,
        b,
      } from "pkg";
    `;
    expect(collectImports(src, "file.ts")).toEqual(["pkg"]);
  });

  test("ignores dynamic import() and require()", () => {
    const src = `
      const a = require("a");
      const b = import("b");
    `;
    expect(collectImports(src, "file.ts")).toEqual([]);
  });

  test("does not pick up imports inside comments", () => {
    const src = `
      // import x from "nope1";
      /* import y from "nope2"; */
      import z from "yes";
    `;
    expect(collectImports(src, "file.ts")).toEqual(["yes"]);
  });

  test("dedupes while preserving first-seen order", () => {
    const src = `
      import "a";
      import x from "b";
      import "a";
      import { y } from "b";
    `;
    expect(collectImports(src, "file.ts")).toEqual(["a", "b"]);
  });
});

