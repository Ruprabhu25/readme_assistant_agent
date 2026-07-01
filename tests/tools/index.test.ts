import { describe, expect, it } from "vitest";
import { buildTools } from "../../src/tools/index.js";
import type { SaveReadmeProposal } from "../../src/tools/saveReadme.js";
import { useFixtures } from "./helpers.js";

describe("buildTools", () => {
  const fixture = useFixtures();

  it("assembles every tool under its expected key", async () => {
    const { workspace } = await fixture();
    const tools = buildTools(workspace, () => {});

    expect(Object.keys(tools).sort()).toEqual(
      [
        "findExistingReadme",
        "inspectPackageJson",
        "listFiles",
        "readFile",
        "saveReadme",
        "searchFiles",
        "summarizeFile",
      ].sort(),
    );
  });

  it("wires the onProposeReadme callback through to the saveReadme tool", async () => {
    const { workspace } = await fixture();
    let received: SaveReadmeProposal | null = null;
    const tools = buildTools(workspace, (proposal) => {
      received = proposal;
    });

    await tools.saveReadme.execute!(
      { path: "README.md", content: "# Hello" },
      { toolCallId: "test-call", messages: [] },
    );

    expect(received).not.toBeNull();
    expect(received?.path).toBe("README.md");
    expect(received?.content).toBe("# Hello");
  });
});
