import { describe, expect, it, afterEach } from "vitest";
import path from "node:path";
import { readFile } from "node:fs/promises";
import { createFixtureWorkspace } from "./fixtures.js";
import { makeListFilesTool } from "../src/tools/listFiles.js";
import { makeReadFileTool } from "../src/tools/readFile.js";
import { makeSearchFilesTool } from "../src/tools/searchFiles.js";
import { makeInspectPackageJsonTool } from "../src/tools/inspectPackageJson.js";
import { makeFindExistingReadmeTool } from "../src/tools/findExistingReadme.js";
import { makeSummarizeFileTool } from "../src/tools/summarizeFile.js";
import { makeSaveReadmeTool } from "../src/tools/saveReadme.js";
import { WorkspaceBoundsError } from "../src/workspace.js";

const toolCallOpts = { toolCallId: "test-call", messages: [] };

describe("tools", () => {
  let cleanupFns: Array<() => Promise<void>> = [];

  afterEach(async () => {
    await Promise.all(cleanupFns.map((fn) => fn()));
    cleanupFns = [];
  });

  async function fixture() {
    const f = await createFixtureWorkspace();
    cleanupFns.push(f.cleanup);
    return f;
  }

  it("listFiles lists files under the workspace, excluding node_modules", async () => {
    const { workspace } = await fixture();
    const tool = makeListFilesTool(workspace);
    const result = await tool.execute!({ dir: "." }, toolCallOpts);
    expect(result.files).toContain("package.json");
    expect(result.files).toContain(path.join("src", "index.ts"));
    expect(result.files.some((f: string) => f.includes("node_modules"))).toBe(false);
  });

  it("readFile returns file contents", async () => {
    const { workspace } = await fixture();
    const tool = makeReadFileTool(workspace);
    const result = await tool.execute!({ path: "src/index.ts" }, toolCallOpts);
    expect(result.content).toContain("hello");
    expect(result.truncated).toBe(false);
  });

  it("readFile reports missing files without throwing", async () => {
    const { workspace } = await fixture();
    const tool = makeReadFileTool(workspace);
    const result = await tool.execute!({ path: "does-not-exist.ts" }, toolCallOpts);
    expect(result.error).toBe("File not found");
  });

  it("readFile rejects paths that escape the workspace", async () => {
    const { workspace } = await fixture();
    const tool = makeReadFileTool(workspace);
    await expect(tool.execute!({ path: "../../etc/passwd" }, toolCallOpts)).rejects.toThrow(
      WorkspaceBoundsError,
    );
  });

  it("searchFiles finds a matching substring", async () => {
    const { workspace } = await fixture();
    const tool = makeSearchFilesTool(workspace);
    const result = await tool.execute!({ query: "add", dir: "." }, toolCallOpts);
    expect(result.matchCount).toBeGreaterThan(0);
    expect(result.matches[0].path).toBe(path.join("src", "util.ts"));
  });

  it("inspectPackageJson summarizes dependencies and scripts", async () => {
    const { workspace } = await fixture();
    const tool = makeInspectPackageJsonTool(workspace);
    const result = await tool.execute!({}, toolCallOpts);
    expect(result.found).toBe(true);
    if (result.found) {
      expect(result.name).toBe("fixture-project");
      expect(result.dependencies).toContain("zod");
      expect(result.scripts.build).toBe("tsc");
    }
  });

  it("findExistingReadme reports not found when there is none", async () => {
    const { workspace } = await fixture();
    const tool = makeFindExistingReadmeTool(workspace);
    const result = await tool.execute!({}, toolCallOpts);
    expect(result.found).toBe(false);
  });

  it("findExistingReadme returns contents when a README exists", async () => {
    const { workspace, root } = await fixture();
    const fs = await import("node:fs/promises");
    await fs.writeFile(path.join(root, "README.md"), "# Fixture\n");
    const tool = makeFindExistingReadmeTool(workspace);
    const result = await tool.execute!({}, toolCallOpts);
    expect(result.found).toBe(true);
    if (result.found) {
      expect(result.content).toContain("Fixture");
    }
  });

  it("summarizeFile previews the first lines and reports size", async () => {
    const { workspace } = await fixture();
    const tool = makeSummarizeFileTool(workspace);
    const result = await tool.execute!({ path: "src/util.ts" }, toolCallOpts);
    expect(result.lineCount).toBeGreaterThan(0);
    expect(result.preview).toContain("add");
  });

  it("saveReadme stages a proposal without writing to disk", async () => {
    const { workspace, root } = await fixture();
    let staged: unknown = null;
    const tool = makeSaveReadmeTool(workspace, (p) => {
      staged = p;
    });
    const result = await tool.execute!({ path: "README.md", content: "# Draft" }, toolCallOpts);
    expect(result.staged).toBe(true);
    expect(staged).toEqual({ path: "README.md", content: "# Draft" });
    await expect(readFile(path.join(root, "README.md"))).rejects.toThrow();
  });

  it("saveReadme rejects a target path that escapes the workspace", async () => {
    const { workspace } = await fixture();
    const tool = makeSaveReadmeTool(workspace, () => {});
    await expect(
      tool.execute!({ path: "../outside.md", content: "x" }, toolCallOpts),
    ).rejects.toThrow(WorkspaceBoundsError);
  });
});
