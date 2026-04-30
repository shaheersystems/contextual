# Contextual Robustness Checklist

Use this checklist to evolve the project from a basic repository scanner into a resilient, configurable, agent-friendly codebase context generator.

## Phase 1: Foundation

- [x] Add a project configuration file
  - [ ] Choose a config name, such as `contextual.config.json` or `contextual.config.ts`.
  - [ ] Support `include` glob patterns.
  - [ ] Support `exclude` glob patterns.
  - [ ] Support an `output` path for generated files.
  - [ ] Support enabled language options, such as `typescript`, `javascript`, `python`, `json`, and `markdown`.
  - [ ] Support a maximum file size setting.
  - [ ] Support a `followSymlinks` setting.
  - [ ] Add default config values when no config file exists.
  - [ ] Add config validation with clear error messages.
  - [ ] Add tests for valid config, missing config, and invalid config.
  - Acceptance criteria:
    - The scanner runs without a config file.
    - The scanner respects include and exclude rules.
    - Invalid config fails with a useful message.

- [ ] Improve CLI command structure
  - [ ] Add or standardize a `scan` command.
  - [ ] Keep `init` focused on creating `.CONTEXTUAL` and optional config files.
  - [ ] Add `--output` support.
  - [ ] Add `--include` support.
  - [ ] Add `--exclude` support.
  - [ ] Add `--force` support.
  - [ ] Add `--verbose` support.
  - [ ] Add `--quiet` support.
  - [ ] Add `--json` support.
  - [ ] Add `--markdown` support.
  - Acceptance criteria:
    - Users can run a scan with defaults.
    - Users can override output and filtering from the CLI.
    - CLI flags override config values predictably.

- [ ] Make file scanning resilient
  - [ ] Skip binary files.
  - [ ] Skip files larger than the configured size limit.
  - [ ] Handle unreadable files without crashing.
  - [ ] Handle invalid encodings without crashing.
  - [ ] Collect warnings during scanning.
  - [ ] Include warnings in a final scan report.
  - Acceptance criteria:
    - A single bad file does not fail the whole scan.
    - Skipped files are reported with reasons.

## Phase 2: Parsing Accuracy

- [ ] Replace TypeScript import collection with AST parsing
  - [ ] Evaluate `typescript` compiler API or `ts-morph`.
  - [ ] Detect static imports.
  - [ ] Detect type-only imports.
  - [ ] Detect namespace imports.
  - [ ] Detect default imports.
  - [ ] Detect named imports.
  - [ ] Detect side-effect imports.
  - [ ] Detect dynamic `import()` calls when practical.
  - [ ] Add tests for multiline imports.
  - [ ] Add tests for aliased imports.
  - [ ] Add tests for type-only imports.
  - Acceptance criteria:
    - TypeScript import detection works for common real-world syntax.

- [ ] Replace TypeScript export collection with AST parsing
  - [ ] Detect named exports.
  - [ ] Detect default exports.
  - [ ] Detect type exports.
  - [ ] Detect interface exports.
  - [ ] Detect enum exports.
  - [ ] Detect class exports.
  - [ ] Detect function exports.
  - [ ] Detect variable exports.
  - [ ] Detect re-exports from other modules.
  - [ ] Detect `export * from` statements.
  - [ ] Add fixture tests for each export style.
  - Acceptance criteria:
    - Export detection is accurate across common TypeScript module patterns.

- [ ] Improve Python import parsing
  - [ ] Detect `import module`.
  - [ ] Detect `import module as alias`.
  - [ ] Detect `from module import name`.
  - [ ] Detect `from module import name as alias`.
  - [ ] Detect relative imports.
  - [ ] Detect multiline imports.
  - [ ] Ignore imports inside comments and strings.
  - [ ] Add fixture tests for common Python import styles.
  - Acceptance criteria:
    - Python import detection handles multiline and relative imports.

- [ ] Improve Python export detection
  - [ ] Detect top-level functions.
  - [ ] Detect top-level classes.
  - [ ] Detect top-level constants.
  - [ ] Detect `__all__` when present.
  - [ ] Distinguish public and private names.
  - [ ] Add fixture tests for common export styles.
  - Acceptance criteria:
    - Python export detection produces useful public API summaries.

- [ ] Add parsers for common project files
  - [ ] Parse `package.json` scripts.
  - [ ] Parse `package.json` dependencies.
  - [ ] Parse `tsconfig.json` key compiler options.
  - [ ] Parse Markdown headings.
  - [ ] Parse JSON top-level keys.
  - [ ] Add optional YAML support.
  - [ ] Add optional TOML support.
  - Acceptance criteria:
    - Project metadata files produce structured summaries instead of generic text summaries.

## Phase 3: Dependency Graph

- [ ] Build an internal dependency graph model
  - [ ] Define a graph node shape for files.
  - [ ] Define a graph edge shape for imports and references.
  - [ ] Resolve relative imports to local files.
  - [ ] Preserve external package imports separately.
  - [ ] Handle extensionless TypeScript imports.
  - [ ] Handle index file resolution.
  - [ ] Add tests for graph construction.
  - Acceptance criteria:
    - The scanner can identify which local files depend on each other.

- [ ] Add graph analysis features
  - [ ] Detect entry points.
  - [ ] Detect orphaned files.
  - [ ] Detect circular dependencies.
  - [ ] Detect highly connected modules.
  - [ ] Detect test files related to source files.
  - [ ] Group files by directory or feature area.
  - Acceptance criteria:
    - The generated output highlights important structural relationships.

- [ ] Generate graph output
  - [ ] Write `.CONTEXTUAL/dependency-graph.json`.
  - [ ] Add a Markdown dependency summary.
  - [ ] Optionally support Mermaid graph output for small projects.
  - [ ] Avoid huge unreadable graphs for large projects.
  - Acceptance criteria:
    - Machine-readable graph data is available for tooling.
    - Human-readable graph summaries stay concise.

## Phase 4: Output Quality

- [ ] Generate machine-readable project context
  - [ ] Write `.CONTEXTUAL/project-structure.json`.
  - [ ] Include files, languages, imports, exports, warnings, and metadata.
  - [ ] Include scan timestamp.
  - [ ] Include scanner version.
  - [ ] Include config used for the scan.
  - Acceptance criteria:
    - Other tools can consume project context without parsing Markdown.

- [ ] Improve Markdown output
  - [ ] Add a concise project summary.
  - [ ] Add detected package manager.
  - [ ] Add detected framework or runtime.
  - [ ] Add available scripts.
  - [ ] Add main entry points.
  - [ ] Add test strategy summary.
  - [ ] Add important directories.
  - [ ] Add generated files.
  - [ ] Add warnings and skipped files.
  - [ ] Fix tree rendering so box-drawing characters display correctly.
  - Acceptance criteria:
    - The Markdown is useful to both humans and coding agents.

- [ ] Add agent-focused guidance sections
  - [ ] Add "Where to Start".
  - [ ] Add "Likely Edit Zones".
  - [ ] Add "Do Not Edit" or generated file hints.
  - [ ] Add "Common Commands".
  - [ ] Add "Testing Notes".
  - [ ] Add "Architecture Notes" when inferable.
  - Acceptance criteria:
    - A coding agent can quickly understand where to inspect and edit.

## Phase 5: Performance and Scale

- [ ] Add incremental scanning
  - [ ] Compute stable file hashes.
  - [ ] Store scan cache in `.CONTEXTUAL/cache.json`.
  - [ ] Rescan changed files only.
  - [ ] Remove deleted files from cache.
  - [ ] Add `--force` to ignore cache.
  - [ ] Add tests for cache hits and cache invalidation.
  - Acceptance criteria:
    - Repeated scans are faster on unchanged projects.

- [ ] Improve large-repository behavior
  - [ ] Stream file reads where practical.
  - [ ] Limit concurrent file reads.
  - [ ] Avoid loading huge files into memory.
  - [ ] Add progress output in verbose mode.
  - [ ] Add timing metrics.
  - Acceptance criteria:
    - The scanner remains responsive on large repositories.

- [ ] Strengthen ignore handling
  - [ ] Respect `.gitignore`.
  - [ ] Respect config excludes.
  - [ ] Ignore common generated directories by default.
  - [ ] Ignore dependency directories by default.
  - [ ] Add tests for nested `.gitignore` behavior if supported.
  - Acceptance criteria:
    - Generated, dependency, and ignored files are not scanned accidentally.

## Phase 6: Testing and Quality Gates

- [ ] Add fixture-based integration tests
  - [ ] Create small TypeScript fixture project.
  - [ ] Create small Python fixture project.
  - [ ] Create mixed-language fixture project.
  - [ ] Create fixture project with ignored files.
  - [ ] Create fixture project with syntax errors.
  - Acceptance criteria:
    - Full scans can be tested against realistic project layouts.

- [ ] Add snapshot tests for generated output
  - [ ] Snapshot Markdown output.
  - [ ] Snapshot JSON output.
  - [ ] Snapshot dependency graph output.
  - [ ] Normalize timestamps and paths before snapshot comparison.
  - Acceptance criteria:
    - Output regressions are easy to detect.

- [ ] Add CLI behavior tests
  - [ ] Test default scan command.
  - [ ] Test config loading.
  - [ ] Test CLI flag overrides.
  - [ ] Test invalid arguments.
  - [ ] Test failure messaging.
  - Acceptance criteria:
    - CLI behavior is covered beyond helper-level unit tests.

- [ ] Add quality scripts
  - [ ] Add or verify `test` script.
  - [ ] Add or verify `typecheck` script.
  - [ ] Add linting if the project wants it.
  - [ ] Add formatting if the project wants it.
  - [ ] Document all scripts in README.
  - Acceptance criteria:
    - Contributors can run one or two commands to verify changes.

## Phase 7: Developer Experience

- [ ] Improve README documentation
  - [ ] Explain what the tool does.
  - [ ] Add installation instructions.
  - [ ] Add quick start.
  - [ ] Add CLI command examples.
  - [ ] Add config examples.
  - [ ] Add output examples.
  - [ ] Add troubleshooting notes.
  - Acceptance criteria:
    - A new user can install and run the tool without reading source code.

- [ ] Add example outputs
  - [ ] Include a small sample `.CONTEXTUAL/project-structure.md`.
  - [ ] Include a small sample `.CONTEXTUAL/project-structure.json`.
  - [ ] Include a small sample `.CONTEXTUAL/dependency-graph.json`.
  - Acceptance criteria:
    - Users can see the expected value before running the tool.

- [ ] Add release readiness metadata
  - [ ] Confirm package name.
  - [ ] Confirm CLI binary name.
  - [ ] Confirm package entry points.
  - [ ] Add license if publishing is intended.
  - [ ] Add changelog if releases are planned.
  - Acceptance criteria:
    - The package is ready for local use or publication.

## Phase 8: Advanced Capabilities

- [ ] Add framework detection
  - [ ] Detect Next.js.
  - [ ] Detect Vite.
  - [ ] Detect React.
  - [ ] Detect Express or similar Node servers.
  - [ ] Detect Bun projects.
  - [ ] Detect Python package managers when relevant.
  - Acceptance criteria:
    - Output includes useful framework/runtime hints.

- [ ] Add route and API discovery
  - [ ] Detect Next.js App Router routes.
  - [ ] Detect Next.js Pages Router routes.
  - [ ] Detect Express route declarations where practical.
  - [ ] Detect common API handler files.
  - Acceptance criteria:
    - Web projects get route-level context.

- [ ] Add ownership and edit-zone inference
  - [ ] Group files by feature directory.
  - [ ] Identify command modules.
  - [ ] Identify helper modules.
  - [ ] Identify tests related to implementation files.
  - [ ] Identify generated or build output files.
  - Acceptance criteria:
    - Output helps contributors choose the right files to inspect first.

- [ ] Add validation command
  - [ ] Add `contextual validate`.
  - [ ] Validate generated context files exist.
  - [ ] Validate JSON output shape.
  - [ ] Validate dependency graph consistency.
  - [ ] Report stale context if source files changed after generation.
  - Acceptance criteria:
    - Users can verify whether `.CONTEXTUAL` is current and usable.

## Suggested Implementation Order

1. Add config loading and validation.
2. Add structured JSON output.
3. Improve Markdown output and fix tree rendering.
4. Add TypeScript AST-based import/export parsing.
5. Add dependency graph construction.
6. Add fixture-based integration tests.
7. Add incremental scanning and cache support.
8. Add framework and route detection.
9. Expand README and examples.
10. Add validation and release-readiness polish.

## Definition of Done

- [ ] The scanner works on small and medium projects without crashing.
- [ ] The scanner respects config, CLI flags, and ignore files.
- [ ] Markdown output is readable and agent-friendly.
- [ ] JSON output is stable and machine-readable.
- [ ] Dependency graph output is available.
- [ ] Bad files produce warnings instead of failures.
- [ ] Unit tests cover parsers and helpers.
- [ ] Integration tests cover full project scans.
- [ ] README explains installation, usage, config, and examples.
- [ ] Generated `.CONTEXTUAL` files are useful enough for a coding agent to answer project-structure questions quickly.
