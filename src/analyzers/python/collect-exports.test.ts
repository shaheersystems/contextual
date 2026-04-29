import { describe, expect, test } from "bun:test";
import { collectPythonExports } from "./collect-exports.js";

describe("collectPythonExports", () => {
  test("collects top-level def/class names", () => {
    const src = `
def foo():
  pass

class Bar:
  pass
`;
    expect(collectPythonExports(src)).toEqual(["foo", "Bar"]);
  });

  test("ignores indented defs/classes", () => {
    const src = `
def top():
  def inner():
    pass

class Outer:
  class Inner:
    pass
`;
    expect(collectPythonExports(src)).toEqual(["top", "Outer"]);
  });

  test("ignores private names", () => {
    const src = `
def _private():
  pass

class _Hidden:
  pass

def public():
  pass
`;
    expect(collectPythonExports(src)).toEqual(["public"]);
  });

  test("ignores commented exports", () => {
    const src = `
# def nope():
#   pass
def yes():
  pass
`;
    expect(collectPythonExports(src)).toEqual(["yes"]);
  });
});
