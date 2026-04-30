import fs from "fs";
import os from "os";
import path from "path";
import { afterEach, describe, expect, test } from "bun:test";
import { DEFAULT_CONFIG, loadContextualConfig, validateContextualConfig } from "./contextual-config.js";

let tmpDirs: string[] = [];

function makeTmpDir(): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "contextual-config-"));
  tmpDirs.push(dir);
  return dir;
}

afterEach(() => {
  for (const dir of tmpDirs) {
    try {
      fs.rmSync(dir, { recursive: true, force: true });
    } catch {
      // best-effort cleanup
    }
  }
  tmpDirs = [];
});

describe("loadContextualConfig", () => {
  test("returns defaults when config file does not exist", () => {
    const root = makeTmpDir();
    expect(loadContextualConfig(root)).toEqual({ config: DEFAULT_CONFIG });
  });

  test("loads, validates, and merges a valid config", () => {
    const root = makeTmpDir();
    fs.writeFileSync(
      path.join(root, "contextual.config.json"),
      JSON.stringify({
        include: ["src/**/*.ts"],
        exclude: ["**/*.test.ts"],
        output: ".CONTEXTUAL/out.md",
        languages: ["typescript", "json"],
        maxFileSizeBytes: 123,
        followSymlinks: true,
      }),
      "utf8",
    );

    const loaded = loadContextualConfig(root);
    expect(loaded.configPath).toBe(path.join(root, "contextual.config.json"));
    expect(loaded.config).toEqual({
      include: ["src/**/*.ts"],
      exclude: ["**/*.test.ts"],
      output: ".CONTEXTUAL/out.md",
      languages: ["typescript", "json"],
      maxFileSizeBytes: 123,
      followSymlinks: true,
    });
  });

  test("throws a helpful error for invalid JSON", () => {
    const root = makeTmpDir();
    fs.writeFileSync(path.join(root, "contextual.config.json"), "{", "utf8");
    expect(() => loadContextualConfig(root)).toThrow(/Failed to parse contextual config/u);
  });
});

describe("validateContextualConfig", () => {
  test("throws with a field-specific message for invalid languages", () => {
    expect(() =>
      validateContextualConfig({ languages: ["ruby"] }, { configPath: "/repo/contextual.config.json" }),
    ).toThrow(/languages.*unsupported/u);
  });

  test("throws with a clear message for non-positive maxFileSizeBytes", () => {
    expect(() => validateContextualConfig({ maxFileSizeBytes: 0 })).toThrow(/maxFileSizeBytes/u);
  });
});

