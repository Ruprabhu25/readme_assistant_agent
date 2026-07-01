import { readFile } from "node:fs/promises";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  makeSaveReadmeTool,
  type SaveReadmeProposal,
} from "../../src/tools/saveReadme.js";
import { WorkspaceBoundsError } from "../../src/workspace.js";
import { toolCallOpts, useFixtures } from "./helpers.js";

describe("saveReadme", () => {
  const fixture = useFixtures();

  it("stages a proposal without writing to disk", async () => {
    const { workspace, root } = await fixture();
    let staged: SaveReadmeProposal | null = null;
    const tool = makeSaveReadmeTool(workspace, (p) => {
      staged = p;
    });
    const result = await tool.execute!(
      { path: "README.md", content: "# Draft" },
      toolCallOpts,
    );
    expect(result.staged).toBe(true);
    expect(staged).toEqual({ path: "README.md", content: "# Draft" });
    await expect(readFile(path.join(root, "README.md"))).rejects.toThrow();
  });

  it("reports the character count of the staged content", async () => {
    const { workspace } = await fixture();
    const tool = makeSaveReadmeTool(workspace, () => {});
    const result = await tool.execute!(
      { path: "README.md", content: "hello" },
      toolCallOpts,
    );
    expect(result.chars).toBe(5);
  });

  it("calls onPropose exactly once per invocation", async () => {
    const { workspace } = await fixture();
    let calls = 0;
    const tool = makeSaveReadmeTool(workspace, () => {
      calls += 1;
    });
    await tool.execute!({ path: "README.md", content: "one" }, toolCallOpts);
    await tool.execute!({ path: "README.md", content: "two" }, toolCallOpts);
    expect(calls).toBe(2);
  });

  it("rejects a target path that escapes the workspace", async () => {
    const { workspace } = await fixture();
    const tool = makeSaveReadmeTool(workspace, () => {});
    await expect(
      tool.execute!({ path: "../outside.md", content: "x" }, toolCallOpts),
    ).rejects.toThrow(WorkspaceBoundsError);
  });

  it("does not invoke onPropose when the path escapes the workspace", async () => {
    const { workspace } = await fixture();
    let called = false;
    const tool = makeSaveReadmeTool(workspace, () => {
      called = true;
    });
    await expect(
      tool.execute!({ path: "../outside.md", content: "x" }, toolCallOpts),
    ).rejects.toThrow(WorkspaceBoundsError);
    expect(called).toBe(false);
  });

  it("rejects a non-.md target path", async () => {
    const { workspace } = await fixture();
    let called = false;
    const tool = makeSaveReadmeTool(workspace, () => {
      called = true;
    });
    const result = await tool.execute!(
      { path: "notes.txt", content: "x" },
      toolCallOpts,
    );
    expect(result.staged).toBe(false);
    expect(result.error).toMatch(/\.md/);
    expect(called).toBe(false);
  });

  it("accepts .MD with any casing", async () => {
    const { workspace } = await fixture();
    const tool = makeSaveReadmeTool(workspace, () => {});
    const result = await tool.execute!(
      { path: "README.MD", content: "x" },
      toolCallOpts,
    );
    expect(result.staged).toBe(true);
  });
});
