import { describe, expect, it } from "vitest";
import path from "node:path";
import { writeFile } from "node:fs/promises";
import { makeFindExistingReadmeTool } from "../../src/tools/findExistingReadme.js";
import { toolCallOpts, useFixtures } from "./helpers.js";

describe("findExistingReadme", () => {
  const fixture = useFixtures();

  it("reports not found when there is none", async () => {
    const { workspace } = await fixture();
    const tool = makeFindExistingReadmeTool(workspace);
    const result = await tool.execute!({}, toolCallOpts);
    expect(result.found).toBe(false);
  });

  it("returns contents when README.md exists", async () => {
    const { workspace, root } = await fixture();
    await writeFile(path.join(root, "README.md"), "# Fixture\n");
    const tool = makeFindExistingReadmeTool(workspace);
    const result = await tool.execute!({}, toolCallOpts);
    expect(result.found).toBe(true);
    if (result.found) {
      expect(result.path).toBe("README.md");
      expect(result.content).toContain("Fixture");
    }
  });

  it("finds an extensionless README when README.md is absent", async () => {
    const { workspace, root } = await fixture();
    await writeFile(path.join(root, "README"), "extensionless readme\n");
    const tool = makeFindExistingReadmeTool(workspace);
    const result = await tool.execute!({}, toolCallOpts);
    expect(result.found).toBe(true);
    if (result.found) {
      expect(result.path).toBe("README");
      expect(result.content).toContain("extensionless");
    }
  });

  it("prefers README.md over other candidates when multiple exist", async () => {
    const { workspace, root } = await fixture();
    await writeFile(path.join(root, "README"), "fallback\n");
    await writeFile(path.join(root, "README.md"), "canonical\n");
    const tool = makeFindExistingReadmeTool(workspace);
    const result = await tool.execute!({}, toolCallOpts);
    expect(result.found).toBe(true);
    if (result.found) {
      expect(result.path).toBe("README.md");
      expect(result.content).toContain("canonical");
    }
  });
});
