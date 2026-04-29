import { describe, expect, test } from "bun:test";
import { collectPythonImports } from "./collect-imports.js";

describe("collectPythonImports", () => {
  test("collects simple imports", () => {
    const src = `
import os
import sys as system
import a, b as c, d.e
`;
    expect(collectPythonImports(src)).toEqual(["os", "sys", "a", "b", "d.e"]);
  });

  test("collects from-import module specifiers", () => {
    const src = `
from typing import Any, Dict
from a.b import c as d
`;
    expect(collectPythonImports(src)).toEqual(["typing", "a.b"]);
  });

  test("ignores commented imports", () => {
    const src = `
# import nope
import yes
`;
    expect(collectPythonImports(src)).toEqual(["yes"]);
  });

  test("dedupes while preserving first-seen order", () => {
    const src = `
import a
from a import b
import a as x
`;
    expect(collectPythonImports(src)).toEqual(["a"]);
  });
});
