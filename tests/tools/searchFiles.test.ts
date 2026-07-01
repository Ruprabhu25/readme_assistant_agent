import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { makeSearchFilesTool } from "../../src/tools/searchFiles.js";
import { WorkspaceBoundsError } from "../../src/workspace.js";
import { toolCallOpts, useFixtures } from "./helpers.js";

describe("searchFiles", () => {
  const fixture = useFixtures();

  it("finds a matching substring", async () => {
    const { workspace } = await fixture();
    const tool = makeSearchFilesTool(workspace);
    const result = await tool.execute!(
      { query: "add", dir: "." },
      toolCallOpts,
    );
    expect(result.matchCount).toBeGreaterThan(0);
    expect(result.matches[0].path).toBe(path.join("src", "util.ts"));
  });

  it("matches case-insensitively", async () => {
    const { workspace } = await fixture();
    const tool = makeSearchFilesTool(workspace);
    const result = await tool.execute!(
      { query: "ADD", dir: "." },
      toolCallOpts,
    );
    expect(result.matchCount).toBeGreaterThan(0);
  });

  it("returns no matches for a query that does not appear", async () => {
    const { workspace } = await fixture();
    const tool = makeSearchFilesTool(workspace);
    const result = await tool.execute!(
      { query: "zzz-nope-zzz", dir: "." },
      toolCallOpts,
    );
    expect(result.matchCount).toBe(0);
    expect(result.matches).toEqual([]);
  });

  it("restricts the search to the given subdirectory", async () => {
    const { workspace, root } = await fixture();
    await mkdir(path.join(root, "docs"), { recursive: true });
    await writeFile(
      path.join(root, "docs", "notes.md"),
      "add some notes here\n",
    );

    const tool = makeSearchFilesTool(workspace);
    const result = await tool.execute!(
      { query: "add", dir: "src" },
      toolCallOpts,
    );
    expect(
      result.matches.every((m: { path: string }) => m.path.startsWith("src")),
    ).toBe(true);
    expect(
      result.matches.some((m: { path: string }) => m.path.includes("docs")),
    ).toBe(false);
  });

  it("never searches inside node_modules", async () => {
    const { workspace } = await fixture();
    const tool = makeSearchFilesTool(workspace);
    const result = await tool.execute!(
      { query: "module.exports", dir: "." },
      toolCallOpts,
    );
    expect(
      result.matches.some((m: { path: string }) =>
        m.path.includes("node_modules"),
      ),
    ).toBe(false);
  });

  it("caps results at the maximum match count", async () => {
    const { workspace, root } = await fixture();
    const manyLines = Array.from(
      { length: 80 },
      (_, i) => `needle line ${i}`,
    ).join("\n");
    await writeFile(path.join(root, "many.txt"), manyLines);

    const tool = makeSearchFilesTool(workspace);
    const result = await tool.execute!(
      { query: "needle", dir: "." },
      toolCallOpts,
    );
    expect(result.matchCount).toBeLessThanOrEqual(50);
  });

  it("rejects a search directory that escapes the workspace", async () => {
    const { workspace } = await fixture();
    const tool = makeSearchFilesTool(workspace);
    await expect(
      tool.execute!({ query: "add", dir: "../../etc" }, toolCallOpts),
    ).rejects.toThrow(WorkspaceBoundsError);
  });
});
