import { promises as fs } from "node:fs";
import { tool } from "ai";
import { z } from "zod";
import type { Workspace } from "../workspace.js";

export function makeInspectPackageJsonTool(workspace: Workspace) {
  return tool({
    description:
      "Read and summarize the workspace's package.json: name, description, scripts, and dependencies.",
    inputSchema: z.object({}),
    execute: async () => {
      const abs = workspace.resolve("package.json");
      const raw = await fs.readFile(abs, "utf8").catch(() => null);
      if (raw === null) {
        return { found: false as const };
      }
      try {
        const pkg = JSON.parse(raw);
        return {
          found: true as const,
          name: pkg.name,
          version: pkg.version,
          description: pkg.description,
          scripts: pkg.scripts ?? {},
          dependencies: Object.keys(pkg.dependencies ?? {}),
          devDependencies: Object.keys(pkg.devDependencies ?? {}),
        };
      } catch {
        return {
          found: true as const,
          error: "package.json is not valid JSON",
        };
      }
    },
  });
}
