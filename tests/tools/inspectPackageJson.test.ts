import { rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { makeInspectPackageJsonTool } from "../../src/tools/inspectPackageJson.js";
import { toolCallOpts, useFixtures } from "./helpers.js";

describe("inspectPackageJson", () => {
  const fixture = useFixtures();

  it("summarizes dependencies and scripts", async () => {
    const { workspace } = await fixture();
    const tool = makeInspectPackageJsonTool(workspace);
    const result = await tool.execute!({}, toolCallOpts);
    expect(result.found).toBe(true);
    if (result.found) {
      expect(result.name).toBe("fixture-project");
      expect(result.dependencies).toContain("zod");
      expect(result.devDependencies).toContain("typescript");
      expect(result.scripts.build).toBe("tsc");
    }
  });

  it("reports not found when there is no package.json", async () => {
    const { workspace, root } = await fixture();
    await rm(path.join(root, "package.json"));
    const tool = makeInspectPackageJsonTool(workspace);
    const result = await tool.execute!({}, toolCallOpts);
    expect(result.found).toBe(false);
  });

  it("reports an error when package.json is not valid JSON", async () => {
    const { workspace, root } = await fixture();
    await writeFile(path.join(root, "package.json"), "{ not valid json");
    const tool = makeInspectPackageJsonTool(workspace);
    const result = await tool.execute!({}, toolCallOpts);
    expect(result.found).toBe(true);
    expect(result.error).toBe("package.json is not valid JSON");
  });

  it("defaults dependencies to an empty list when absent", async () => {
    const { workspace, root } = await fixture();
    await writeFile(
      path.join(root, "package.json"),
      JSON.stringify({ name: "no-deps" }),
    );
    const tool = makeInspectPackageJsonTool(workspace);
    const result = await tool.execute!({}, toolCallOpts);
    expect(result.found).toBe(true);
    if (result.found) {
      expect(result.dependencies).toEqual([]);
      expect(result.devDependencies).toEqual([]);
      expect(result.scripts).toEqual({});
    }
  });
});
