import { tool } from "ai";
import { z } from "zod";
import type { Workspace } from "../workspace.js";
import { formatFileTree, listFilesRecursive } from "../workspace.js";

export function makeListFilesTool(workspace: Workspace) {
  return tool({
    description:
      "List files in the workspace, optionally restricted to a subdirectory. Ignores node_modules, .git, dist, build. " +
      "The returned `tree` field is a pre-rendered ASCII tree of the exact same files — reproduce it verbatim for any " +
      "directory structure section rather than hand-drawing one from `files`, since manual ASCII art can drop entries.",
    inputSchema: z.object({
      dir: z
        .string()
        .default(".")
        .describe("Subdirectory to list, relative to the workspace root. Defaults to the root."),
    }),
    execute: async ({ dir }) => {
      const abs = workspace.resolve(dir);
      const files = await listFilesRecursive(workspace.root, abs);
      return { dir, count: files.length, files, tree: formatFileTree(files) };
    },
  });
}
