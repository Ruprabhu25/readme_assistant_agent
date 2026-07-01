import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
  formatFileTree,
  listFilesRecursive,
  Workspace,
  WorkspaceBoundsError,
} from "../src/workspace.js";

describe("Workspace", () => {
  let root: string;

  beforeAll(async () => {
    root = await mkdtemp(path.join(tmpdir(), "readme-assistant-"));
    await mkdir(path.join(root, "src"));
    await writeFile(path.join(root, "package.json"), "{}");
    await writeFile(path.join(root, "src", "index.ts"), "export {}");
  });

  afterAll(async () => {
    await rm(root, { recursive: true, force: true });
  });

  it("resolves paths inside the workspace", async () => {
    const workspace = await Workspace.create(root);
    expect(workspace.resolve("package.json")).toBe(
      path.join(root, "package.json"),
    );
    expect(workspace.resolve("src/index.ts")).toBe(
      path.join(root, "src", "index.ts"),
    );
  });

  it("rejects paths that escape the workspace root", async () => {
    const workspace = await Workspace.create(root);
    expect(() => workspace.resolve("../../etc/passwd")).toThrow(
      WorkspaceBoundsError,
    );
    expect(() => workspace.resolve("/etc/passwd")).toThrow(
      WorkspaceBoundsError,
    );
  });

  it("rejects a workspace root that is not a directory", async () => {
    await expect(
      Workspace.create(path.join(root, "package.json")),
    ).rejects.toThrow();
  });

  it("lists files recursively relative to the root, ignoring node_modules", async () => {
    await mkdir(path.join(root, "node_modules"));
    await writeFile(path.join(root, "node_modules", "ignored.js"), "");

    const files = await listFilesRecursive(root, root);
    expect(files).toContain("package.json");
    expect(files).toContain(path.join("src", "index.ts"));
    expect(files.some((f) => f.includes("node_modules"))).toBe(false);
  });

  it("ignores dist-bin, .claude, and .env files, but keeps .env.example", async () => {
    await mkdir(path.join(root, "dist-bin"));
    await writeFile(path.join(root, "dist-bin", "bundle.cjs"), "");
    await mkdir(path.join(root, ".claude"));
    await writeFile(path.join(root, ".claude", "scheduled_tasks.lock"), "");
    await writeFile(path.join(root, ".env"), "SECRET=1");
    await writeFile(path.join(root, ".env.local"), "SECRET=2");
    await writeFile(path.join(root, ".env.example"), "SECRET=");

    const files = await listFilesRecursive(root, root);
    expect(files.some((f) => f.includes("dist-bin"))).toBe(false);
    expect(files.some((f) => f.includes(".claude"))).toBe(false);
    expect(files).not.toContain(".env");
    expect(files).not.toContain(".env.local");
    expect(files).toContain(".env.example");
  });
});

describe("formatFileTree", () => {
  it("nests files under their parent directories, dirs before files", () => {
    const tree = formatFileTree([
      "package.json",
      path.join("src", "index.ts"),
      path.join("src", "util.ts"),
    ]);
    expect(tree).toBe(
      [
        "├── src/",
        "│   ├── index.ts",
        "│   └── util.ts",
        "└── package.json",
      ].join("\n"),
    );
  });

  it("includes every path exactly once, even for deeply nested siblings", () => {
    const paths = [
      "a.ts",
      path.join("src", "tools", "index.ts"),
      path.join("src", "tools", "listFiles.ts"),
      path.join("src", "ui.ts"),
      path.join("src", "workspace.ts"),
    ];
    const tree = formatFileTree(paths);
    for (const p of paths) {
      expect(tree).toContain(path.basename(p));
    }
  });
});
