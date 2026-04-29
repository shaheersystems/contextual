import { describe, expect, test } from "bun:test";
import { collectExports } from "./collect-exports.js";

describe("collectExports", () => {
  test("returns [] for non-js/ts extensions when fileNameOrPath is provided", () => {
    expect(collectExports("export const x = 1;", "data.json")).toEqual([]);
  });

  test("collects default export as 'default'", () => {
    expect(collectExports("export default function () {}", "file.ts")).toEqual([
      "default",
    ]);
  });

  test("collects exported declarations", () => {
    const src = `
      export const foo = 1;
      export let bar = 2;
      export var baz = 3;
      export async function qux() {}
      export class Zoo {}
      export enum Color { Red }
      export type T = { a: 1 };
      export interface I { a: 1 }
    `;
    expect(collectExports(src, "file.ts")).toEqual([
      "foo",
      "bar",
      "baz",
      "qux",
      "Zoo",
      "Color",
      "T",
      "I",
    ]);
  });

  test("collects export lists (including aliases)", () => {
    const src = `
      export { a, b as c };
      export type { T1, T2 as T3 } from "pkg";
      export { default as DefaultThing } from "other";
    `;
    expect(collectExports(src, "file.ts")).toEqual([
      "a",
      "c",
      "T1",
      "T3",
      "DefaultThing",
    ]);
  });

  test("ignores exports inside comments", () => {
    const src = `
      // export const nope = 1;
      /* export { x } from "nope"; */
      export const yes = 1;
    `;
    expect(collectExports(src, "file.ts")).toEqual(["yes"]);
  });

  test("dedupes while preserving first-seen order", () => {
    const src = `
      export { a, b as c };
      export const a = 1;
      export { c };
    `;
    expect(collectExports(src, "file.ts")).toEqual(["a", "c"]);
  });
});

