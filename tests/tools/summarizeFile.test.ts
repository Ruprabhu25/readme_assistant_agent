import { describe, expect, it } from "vitest";
import path from "node:path";
import { writeFile } from "node:fs/promises";
import { makeSummarizeFileTool } from "../../src/tools/summarizeFile.js";
import { WorkspaceBoundsError } from "../../src/workspace.js";
import { toolCallOpts, useFixtures } from "./helpers.js";

describe("summarizeFile", () => {
  const fixture = useFixtures();

  it("previews the first lines and reports size", async () => {
    const { workspace } = await fixture();
    const tool = makeSummarizeFileTool(workspace);
    const result = await tool.execute!({ path: "src/util.ts" }, toolCallOpts);
    expect(result.lineCount).toBeGreaterThan(0);
    expect(result.preview).toContain("add");
    expect(result.sizeBytes).toBeGreaterThan(0);
  });

  it("reports missing files without throwing", async () => {
    const { workspace } = await fixture();
    const tool = makeSummarizeFileTool(workspace);
    const result = await tool.execute!({ path: "does-not-exist.ts" }, toolCallOpts);
    expect(result.error).toBe("File not found");
  });

  it("truncates the preview to the first 40 lines for long files", async () => {
    const { workspace, root } = await fixture();
    const lines = Array.from({ length: 100 }, (_, i) => `line ${i}`);
    await writeFile(path.join(root, "long.txt"), lines.join("\n"));

    const tool = makeSummarizeFileTool(workspace);
    const result = await tool.execute!({ path: "long.txt" }, toolCallOpts);
    expect(result.lineCount).toBe(100);
    expect(result.preview?.split("\n")).toHaveLength(40);
    expect(result.preview).not.toContain("line 40");
    expect(result.preview).toContain("line 39");
  });

  it("rejects a path that escapes the workspace", async () => {
    const { workspace } = await fixture();
    const tool = makeSummarizeFileTool(workspace);
    await expect(tool.execute!({ path: "../../etc/passwd" }, toolCallOpts)).rejects.toThrow(
      WorkspaceBoundsError,
    );
  });
});
