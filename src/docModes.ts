export type DocModeId =
  | "readme"
  | "api-docs"
  | "contributor-guide"
  | "quickstart";

export interface DocMode {
  id: DocModeId;
  label: string;
  defaultFilename: string;
  /** Mode-specific instructions inserted into the agent's system prompt. */
  focus: string;
}

export const DOC_MODES: Record<DocModeId, DocMode> = {
  readme: {
    id: "readme",
    label: "Beginner-friendly README",
    defaultFilename: "README.md",
    focus: `Current mode: Beginner-friendly README (default target file: README.md)

1. Check for an existing README first (findExistingReadme).
2. Inspect package.json and call listFiles to understand the project layout.
3. Read the entrypoint and config files (e.g. the CLI entry, config/setup modules), not just package.json — these are where real setup requirements (env vars, required config files) and real usage behavior (CLI arguments, interactive flows) actually live.
4. Produce a clear, well-structured README aimed at a newcomer with no prior context on the project:
   - Do NOT include a Contributing or License section by default — these are the most common boilerplate you'll be tempted to add out of habit. Only include a Contributing section if a CONTRIBUTING(.md) file appears in the listFiles output, and only include a License section if a LICENSE(.md) file appears there or package.json sets a "license" field.
   - Setup/usage instructions must reflect the actual code you read, not generic boilerplate.
   - A Features section must describe the concrete tools/capabilities you actually discovered, not generic phrasing.`,
  },
  "api-docs": {
    id: "api-docs",
    label: "API docs",
    defaultFilename: "API.md",
    focus: `Current mode: API docs (default target file: API.md)

1. Call listFiles to find the project's exported modules, entrypoints, and public interfaces (e.g. src/index.ts, tools/, routes/).
2. Read each exported function, class, or endpoint definition directly — do not infer signatures from usage sites alone.
3. Produce API reference documentation grounded in the actual signatures you read:
   - For each exported item: name, parameters (with types), return type, and a short description of behavior.
   - Include a minimal usage example only if you can construct it from real code you've read (e.g. a call site) — never invent example values.
   - Group related exports under headings that mirror the project's actual module structure.`,
  },
  "contributor-guide": {
    id: "contributor-guide",
    label: "Contributor guide",
    defaultFilename: "CONTRIBUTING.md",
    focus: `Current mode: Contributor guide (default target file: CONTRIBUTING.md)

1. Inspect package.json scripts (build, test, lint, format) and any lint/format config files (.eslintrc, .prettierrc, biome.json, etc.) via listFiles/readFile.
2. Check for existing CI config (e.g. .github/workflows) to describe what checks run on a PR.
3. Produce a contributor guide grounded in what you found:
   - Local dev setup: exact install/build/test/lint commands taken from package.json scripts, not assumed conventions.
   - Code style expectations only if backed by a discovered config file.
   - Branch/PR conventions only if discoverable (e.g. a PR template); otherwise omit rather than inventing a convention.`,
  },
  quickstart: {
    id: "quickstart",
    label: "Quickstart",
    defaultFilename: "QUICKSTART.md",
    focus: `Current mode: Quickstart (default target file: QUICKSTART.md)

1. Inspect package.json for install/run commands and read the CLI entrypoint for required setup (env vars, config files, flags).
2. Produce a terse, minimal-steps quickstart:
   - Skip explanations, architecture, and feature lists — only the shortest path from clone to a working first run.
   - Number the steps; each step should be a single command or action.
   - Mention only setup that is actually required to run (e.g. required env vars found in code), not optional configuration.`,
  },
};

export const DEFAULT_DOC_MODE: DocModeId = "readme";

export function isDocModeId(value: string): value is DocModeId {
  return value in DOC_MODES;
}

/** Looks for --mode or --mode=<id> in argv, returning a valid DocModeId or null. */
export function parseModeFlag(argv: string[]): DocModeId | null {
  const arg = argv.find((a) => a === "--mode" || a.startsWith("--mode="));
  if (!arg) return null;
  const eq = arg.indexOf("=");
  const value = eq === -1 ? null : arg.slice(eq + 1);
  if (!value) return null;
  return isDocModeId(value) ? value : null;
}

/** Strips --mode/--mode=<id> flags out of argv, leaving positional args. */
export function stripModeFlag(argv: string[]): string[] {
  return argv.filter((a) => a !== "--mode" && !a.startsWith("--mode="));
}

export function describeModes(current: DocModeId): string {
  return Object.values(DOC_MODES)
    .map((m) => {
      const marker = m.id === current ? "*" : " ";
      return `  ${marker} ${m.id} — ${m.label} (${m.defaultFilename})`;
    })
    .join("\n");
}
