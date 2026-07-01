import { promises as fs } from "node:fs";
import { tool } from "ai";
import { z } from "zod";
import type { Workspace } from "../workspace.js";

const MAX_CHARS = 20_000;

export function makeReadFileTool(workspace: Workspace) {
  return tool({
    description:
      "Read the contents of a single file in the workspace, truncated if very large.",
    inputSchema: z.object({
      path: z.string().describe("File path relative to the workspace root."),
    }),
    execute: async ({ path: relPath }) => {
      const abs = workspace.resolve(relPath);
      const stat = await fs.stat(abs).catch(() => null);
      if (!stat || !stat.isFile()) {
        return { path: relPath, error: "File not found" };
      }
      const content = await fs.readFile(abs, "utf8");
      const truncated = content.length > MAX_CHARS;
      return {
        path: relPath,
        content: truncated ? content.slice(0, MAX_CHARS) : content,
        truncated,
        totalChars: content.length,
      };
    },
  });
}
