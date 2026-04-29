# Project structure

Generated from: `C:/Users/DELL/Documents/agents/contextual`

## Directory tree

```
.
├── src/
│   ├── commands/
│   │   ├── directory-scan.ts
│   │   ├── hello.ts
│   │   └── init.ts
│   ├── helpers/
│   │   ├── collect-exports.test.ts
│   │   ├── collect-exports.ts
│   │   ├── collect-imports.test.ts
│   │   ├── collect-imports.ts
│   │   ├── collect-python-exports.test.ts
│   │   ├── collect-python-exports.ts
│   │   ├── collect-python-imports.test.ts
│   │   ├── collect-python-imports.ts
│   │   ├── collect-top-level-keys.test.ts
│   │   ├── collect-top-level-keys.ts
│   │   ├── find-gitignore.ts
│   │   └── identify-language.ts
│   └── cli.ts
├── .gitignore
├── bun.lock
├── index.ts
├── package.json
├── README.md
└── tsconfig.json
```

## File details

### src/commands/directory-scan.ts

- **Language**: TypeScript
- **Description**: Exports: registerDirectoryScanCommand. Uses: commander, fs
- **Imports**: commander, fs
- **Exports**: registerDirectoryScanCommand

### src/commands/hello.ts

- **Language**: TypeScript
- **Description**: Exports: registerHelloCommand. Uses: commander
- **Imports**: commander
- **Exports**: registerHelloCommand

### src/commands/init.ts

- **Language**: TypeScript
- **Description**: Exports: registerInitCommand. Uses: commander, fs, path, ignore, ../helpers/find-gitignore.js, ../helpers/identify-language.js +5 more
- **Imports**: commander, fs, path, ignore, ../helpers/find-gitignore.js, ../helpers/identify-language.js, ../helpers/collect-imports.js, ../helpers/collect-exports.js, ../helpers/collect-python-imports.js, ../helpers/collect-python-exports.js, ../helpers/collect-top-level-keys.js
- **Exports**: registerInitCommand

### src/helpers/collect-exports.test.ts

- **Language**: TypeScript
- **Description**: Exports: foo, bar, baz, qux, Zoo, Color +8 more. Uses: bun:test, ./collect-exports.js
- **Imports**: bun:test, ./collect-exports.js
- **Exports**: foo, bar, baz, qux, Zoo, Color, yes, a, T, I, c, T1, T3, DefaultThing

### src/helpers/collect-exports.ts

- **Language**: TypeScript
- **Description**: Exports: collectExports. Uses: path
- **Imports**: path
- **Exports**: collectExports

### src/helpers/collect-imports.test.ts

- **Language**: TypeScript
- **Description**: Uses: bun:test, ./collect-imports.js, react, @acme/types, ./utils, ../ns +6 more
- **Imports**: bun:test, ./collect-imports.js, react, @acme/types, ./utils, ../ns, reflect-metadata, ./polyfills, pkg, yes, a, b
- **Exports**: (none)

### src/helpers/collect-imports.ts

- **Language**: TypeScript
- **Description**: Exports: collectImports. Uses: path
- **Imports**: path
- **Exports**: collectImports

### src/helpers/collect-python-exports.test.ts

- **Language**: TypeScript
- **Description**: Uses: bun:test, ./collect-python-exports.js
- **Imports**: bun:test, ./collect-python-exports.js
- **Exports**: (none)

### src/helpers/collect-python-exports.ts

- **Language**: TypeScript
- **Description**: Exports: collectPythonExports
- **Imports**: (none)
- **Exports**: collectPythonExports

### src/helpers/collect-python-imports.test.ts

- **Language**: TypeScript
- **Description**: Uses: bun:test, ./collect-python-imports.js
- **Imports**: bun:test, ./collect-python-imports.js
- **Exports**: (none)

### src/helpers/collect-python-imports.ts

- **Language**: TypeScript
- **Description**: Exports: collectPythonImports
- **Imports**: (none)
- **Exports**: collectPythonImports

### src/helpers/collect-top-level-keys.test.ts

- **Language**: TypeScript
- **Description**: Uses: bun:test, ./collect-top-level-keys.js
- **Imports**: bun:test, ./collect-top-level-keys.js
- **Exports**: (none)

### src/helpers/collect-top-level-keys.ts

- **Language**: TypeScript
- **Description**: Exports: collectTopLevelKeys, TopLevelKeyFormat
- **Imports**: (none)
- **Exports**: collectTopLevelKeys, TopLevelKeyFormat

### src/helpers/find-gitignore.ts

- **Language**: TypeScript
- **Description**: Exports: findNearestGitignorePath, getGitignoreContents, getGitignorePatterns. Uses: fs, path
- **Imports**: fs, path
- **Exports**: findNearestGitignorePath, getGitignoreContents, getGitignorePatterns

### src/helpers/identify-language.ts

- **Language**: TypeScript
- **Description**: Exports: identifyLanguage. Uses: path
- **Imports**: path
- **Exports**: identifyLanguage

### src/cli.ts

- **Language**: TypeScript
- **Description**: Uses: commander, ./commands/hello.js, ./commands/directory-scan.js, ./commands/init.js
- **Imports**: commander, ./commands/hello.js, ./commands/directory-scan.js, ./commands/init.js
- **Exports**: (none)

### .gitignore

- **Language**: text
- **Description**: No explicit imports/exports detected.
- **Imports**: (none)
- **Exports**: (none)

### bun.lock

- **Language**: text
- **Description**: No explicit imports/exports detected.
- **Imports**: (none)
- **Exports**: (none)

### index.ts

- **Language**: TypeScript
- **Description**: No explicit imports/exports detected.
- **Imports**: (none)
- **Exports**: (none)

### package.json

- **Language**: JSON
- **Description**: Exports: name, module, type, private, version, bin +4 more
- **Imports**: (none)
- **Exports**: name, module, type, private, version, bin, scripts, dependencies, devDependencies, peerDependencies

### README.md

- **Language**: Markdown
- **Description**: No explicit imports/exports detected.
- **Imports**: (none)
- **Exports**: (none)

### tsconfig.json

- **Language**: JSON
- **Description**: No explicit imports/exports detected.
- **Imports**: (none)
- **Exports**: (none)
