import { describe, expect, it } from "vitest";
import path from "node:path";
import { mkdir, writeFile } from "node:fs/promises";
import { makeListFilesTool } from "../../src/tools/listFiles.js";
import { WorkspaceBoundsError } from "../../src/workspace.js";
import { toolCallOpts, useFixtures } from "./helpers.js";

describe("listFiles", () => {
  const fixture = useFixtures();

  it("lists files under the workspace, excluding node_modules", async () => {
    const { workspace } = await fixture();
    const tool = makeListFilesTool(workspace);
    const result = await tool.execute!({ dir: "." }, toolCallOpts);
    expect(result.files).toContain("package.json");
    expect(result.files).toContain(path.join("src", "index.ts"));
    expect(result.files.some((f: string) => f.includes("node_modules"))).toBe(false);
  });

  it("restricts listing to the given subdirectory", async () => {
    const { workspace } = await fixture();
    const tool = makeListFilesTool(workspace);
    const result = await tool.execute!({ dir: "src" }, toolCallOpts);
    expect(result.files).toEqual([path.join("src", "index.ts"), path.join("src", "util.ts")]);
    expect(result.files).not.toContain("package.json");
  });

  it("returns a pre-rendered tree that includes every returned file", async () => {
    const { workspace } = await fixture();
    const tool = makeListFilesTool(workspace);
    const result = await tool.execute!({ dir: "." }, toolCallOpts);
    for (const file of result.files) {
      const parts = file.split(path.sep);
      expect(result.tree).toContain(parts[parts.length - 1]);
    }
    expect(result.tree).toContain("src/");
    expect(result.tree).toContain("├──");
    expect(result.tree).toContain("└──");
  });

  it("excludes .git, dist, and build directories", async () => {
    const { workspace, root } = await fixture();
    await mkdir(path.join(root, ".git"), { recursive: true });
    await writeFile(path.join(root, ".git", "HEAD"), "ref: refs/heads/main\n");
    await mkdir(path.join(root, "dist"), { recursive: true });
    await writeFile(path.join(root, "dist", "index.js"), "module.exports = {};\n");
    await mkdir(path.join(root, "build"), { recursive: true });
    await writeFile(path.join(root, "build", "out.js"), "module.exports = {};\n");

    const tool = makeListFilesTool(workspace);
    const result = await tool.execute!({ dir: "." }, toolCallOpts);
    expect(result.files.some((f: string) => f.startsWith(".git"))).toBe(false);
    expect(result.files.some((f: string) => f.startsWith("dist"))).toBe(false);
    expect(result.files.some((f: string) => f.startsWith("build"))).toBe(false);
  });

  it("should not be able to list files outside the workspace directory", async () => {
    const { workspace } = await fixture();
    const tool = makeListFilesTool(workspace);
    await expect(tool.execute!({ dir: "../../etc" }, toolCallOpts)).rejects.toThrow(
      WorkspaceBoundsError,
    );
  });

  it("rejects an absolute path outside the workspace", async () => {
    const { workspace } = await fixture();
    const tool = makeListFilesTool(workspace);
    await expect(tool.execute!({ dir: "/etc" }, toolCallOpts)).rejects.toThrow(
      WorkspaceBoundsError,
    );
  });

  it("rejects a directory that does not exist", async () => {
    const { workspace } = await fixture();
    const tool = makeListFilesTool(workspace);
    await expect(tool.execute!({ dir: "does-not-exist" }, toolCallOpts)).rejects.toThrow();
  });
});
