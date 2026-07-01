import { promises as fs } from "node:fs";
import { tool } from "ai";
import { z } from "zod";
import type { Workspace } from "../workspace.js";

const CANDIDATES = ["README.md", "README", "Readme.md", "readme.md"];

export function makeFindExistingReadmeTool(workspace: Workspace) {
  return tool({
    description: "Check whether the workspace already has a README file and return its contents if so.",
    inputSchema: z.object({}),
    execute: async () => {
      for (const candidate of CANDIDATES) {
        const abs = workspace.resolve(candidate);
        const content = await fs.readFile(abs, "utf8").catch(() => null);
        if (content !== null) {
          return { found: true as const, path: candidate, content };
        }
      }
      return { found: false as const };
    },
  });
}
