import { tool } from "ai";
import { z } from "zod";
import type { Workspace } from "../workspace.js";
import { listFilesRecursive } from "../workspace.js";

export function makeListFilesTool(workspace: Workspace) {
  return tool({
    description:
      "List files in the workspace, optionally restricted to a subdirectory. Ignores node_modules, .git, dist, build.",
    inputSchema: z.object({
      dir: z
        .string()
        .default(".")
        .describe("Subdirectory to list, relative to the workspace root. Defaults to the root."),
    }),
    execute: async ({ dir }) => {
      const abs = workspace.resolve(dir);
      const files = await listFilesRecursive(workspace.root, abs);
      return { dir, count: files.length, files };
    },
  });
}
