import { mkdtemp, mkdir, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { Workspace } from "../src/workspace.js";

/** Creates a temp directory with a small representative project and returns a Workspace over it. */
export async function createFixtureWorkspace(): Promise<{ workspace: Workspace; root: string; cleanup: () => Promise<void> }> {
  const root = await mkdtemp(path.join(tmpdir(), "readme-assistant-"));

  await writeFile(
    path.join(root, "package.json"),
    JSON.stringify(
      {
        name: "fixture-project",
        version: "1.0.0",
        description: "A fixture project for tests",
        scripts: { build: "tsc", test: "vitest run" },
        dependencies: { zod: "^3.0.0" },
        devDependencies: { typescript: "^5.0.0" },
      },
      null,
      2,
    ),
  );

  await mkdir(path.join(root, "src"));
  await writeFile(path.join(root, "src", "index.ts"), "export const hello = () => 'world';\n");
  await writeFile(path.join(root, "src", "util.ts"), "export function add(a: number, b: number) {\n  return a + b;\n}\n");

  await mkdir(path.join(root, "node_modules", "some-dep"), { recursive: true });
  await writeFile(path.join(root, "node_modules", "some-dep", "index.js"), "module.exports = {};\n");

  const workspace = await Workspace.create(root);
  return {
    workspace,
    root,
    cleanup: () => rm(root, { recursive: true, force: true }),
  };
}
