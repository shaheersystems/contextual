import { describe, expect, test } from "bun:test";
import { collectTopLevelKeys } from "./collect-top-level-keys.js";

describe("collectTopLevelKeys", () => {
  test("collects JSON object keys", () => {
    expect(collectTopLevelKeys('{"a":1,"b":2}', "json")).toEqual(["a", "b"]);
  });

  test("returns [] for JSON arrays / invalid JSON", () => {
    expect(collectTopLevelKeys('["a","b"]', "json")).toEqual([]);
    expect(collectTopLevelKeys("{", "json")).toEqual([]);
  });

  test("collects YAML top-level keys (conservative)", () => {
    const src = `
# comment
name: app
"quoted key": 1
list:
  - a
  - b
nested:
  child: 1
`;
    expect(collectTopLevelKeys(src, "yaml")).toEqual(["name", "quoted key", "list", "nested"]);
  });

  test("ignores indented YAML keys and list items", () => {
    const src = `
top: 1
  indented: 2
- item
`;
    expect(collectTopLevelKeys(src, "yaml")).toEqual(["top"]);
  });
});

