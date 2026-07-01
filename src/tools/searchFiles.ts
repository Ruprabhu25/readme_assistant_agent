import { promises as fs } from "node:fs";
import { tool } from "ai";
import { z } from "zod";
import type { Workspace } from "../workspace.js";
import { listFilesRecursive } from "../workspace.js";

const MAX_MATCHES = 50;
const MAX_FILE_BYTES = 1_000_000;

export function makeSearchFilesTool(workspace: Workspace) {
  return tool({
    description: "Search file contents in the workspace for a plain-text substring, case-insensitive.",
    inputSchema: z.object({
      query: z.string().min(1).describe("Substring to search for."),
      dir: z.string().default(".").describe("Subdirectory to search within."),
    }),
    execute: async ({ query, dir }) => {
      const absDir = workspace.resolve(dir);
      const files = await listFilesRecursive(workspace.root, absDir);
      const needle = query.toLowerCase();
      const matches: { path: string; line: number; text: string }[] = [];

      for (const relFile of files) {
        if (matches.length >= MAX_MATCHES) break;
        const abs = workspace.resolve(relFile);
        const stat = await fs.stat(abs).catch(() => null);
        if (!stat || stat.size > MAX_FILE_BYTES) continue;

        const content = await fs.readFile(abs, "utf8").catch(() => null);
        if (content === null) continue;

        const lines = content.split("\n");
        for (let i = 0; i < lines.length && matches.length < MAX_MATCHES; i++) {
          if (lines[i].toLowerCase().includes(needle)) {
            matches.push({ path: relFile, line: i + 1, text: lines[i].trim() });
          }
        }
      }

      return { query, matchCount: matches.length, matches };
    },
  });
}
