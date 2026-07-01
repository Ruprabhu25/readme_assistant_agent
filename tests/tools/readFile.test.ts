import { writeFile } from "node:fs/promises";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { makeReadFileTool } from "../../src/tools/readFile.js";
import { WorkspaceBoundsError } from "../../src/workspace.js";
import { toolCallOpts, useFixtures } from "./helpers.js";

describe("readFile", () => {
  const fixture = useFixtures();

  it("returns file contents", async () => {
    const { workspace } = await fixture();
    const tool = makeReadFileTool(workspace);
    const result = await tool.execute!({ path: "src/index.ts" }, toolCallOpts);
    expect(result.content).toContain("hello");
    expect(result.truncated).toBe(false);
  });

  it("reports missing files without throwing", async () => {
    const { workspace } = await fixture();
    const tool = makeReadFileTool(workspace);
    const result = await tool.execute!(
      { path: "does-not-exist.ts" },
      toolCallOpts,
    );
    expect(result.error).toBe("File not found");
  });

  it("reports a directory path as not found rather than reading it", async () => {
    const { workspace } = await fixture();
    const tool = makeReadFileTool(workspace);
    const result = await tool.execute!({ path: "src" }, toolCallOpts);
    expect(result.error).toBe("File not found");
  });

  it("rejects paths that escape the workspace", async () => {
    const { workspace } = await fixture();
    const tool = makeReadFileTool(workspace);
    await expect(
      tool.execute!({ path: "../../etc/passwd" }, toolCallOpts),
    ).rejects.toThrow(WorkspaceBoundsError);
  });

  it("rejects an absolute path outside the workspace", async () => {
    const { workspace } = await fixture();
    const tool = makeReadFileTool(workspace);
    await expect(
      tool.execute!({ path: "/etc/passwd" }, toolCallOpts),
    ).rejects.toThrow(WorkspaceBoundsError);
  });

  it("truncates files larger than the max char limit and reports totalChars", async () => {
    const { workspace, root } = await fixture();
    const big = "x".repeat(25_000);
    await writeFile(path.join(root, "big.txt"), big);

    const tool = makeReadFileTool(workspace);
    const result = await tool.execute!({ path: "big.txt" }, toolCallOpts);
    expect(result.truncated).toBe(true);
    expect(result.content?.length).toBe(20_000);
    expect(result.totalChars).toBe(25_000);
  });
});
