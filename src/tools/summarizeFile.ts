import { promises as fs } from "node:fs";
import { tool } from "ai";
import { z } from "zod";
import type { Workspace } from "../workspace.js";

const PREVIEW_LINES = 40;

export function makeSummarizeFileTool(workspace: Workspace) {
  return tool({
    description:
      "Get a lightweight summary of a file: size, line count, and a preview of its first lines. Use before reading very large files in full.",
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
      const lines = content.split("\n");
      return {
        path: relPath,
        sizeBytes: stat.size,
        lineCount: lines.length,
        preview: lines.slice(0, PREVIEW_LINES).join("\n"),
      };
    },
  });
}
