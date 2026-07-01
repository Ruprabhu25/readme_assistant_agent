import { tool } from "ai";
import { z } from "zod";
import type { Workspace } from "../workspace.js";

export interface SaveReadmeProposal {
  path: string;
  content: string;
}

/**
 * Deliberately does not write to disk: the model can propose a README, but the
 * actual write happens in the CLI only after the user confirms. `onPropose` lets
 * the CLI capture the latest proposal for that confirm step.
 */
export function makeSaveReadmeTool(
  workspace: Workspace,
  onPropose: (p: SaveReadmeProposal) => void,
) {
  return tool({
    description:
      "Propose README content to save to the workspace. This does NOT write the file — it stages a proposal that the user must confirm before anything is written to disk.",
    inputSchema: z.object({
      path: z
        .string()
        .default("README.md")
        .describe("Target path relative to the workspace root."),
      content: z.string().min(1).describe("Full README content to propose."),
    }),
    execute: async ({ path: relPath, content }) => {
      workspace.resolve(relPath); // validate it's in-bounds without writing
      onPropose({ path: relPath, content });
      return {
        staged: true as const,
        path: relPath,
        chars: content.length,
        note: "Proposal staged. Ask the user to confirm before it is written to disk.",
      };
    },
  });
}
