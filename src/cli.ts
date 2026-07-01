#!/usr/bin/env node
import { promises as fs } from "node:fs";
import type { ModelMessage } from "ai";
import { loadModel } from "./config.js";
import { Workspace } from "./workspace.js";
import { buildTools, type SaveReadmeProposal } from "./tools/index.js";
import { runAgentTurn } from "./agent.js";
import {
  confirm,
  createPromptInterface,
  printAssistantPrefix,
  printError,
  printNewline,
  printSystem,
  printTextDelta,
  printToolCall,
  printToolResult,
} from "./ui.js";

function readProposal(holder: { current: SaveReadmeProposal | null }): SaveReadmeProposal | null {
  return holder.current;
}

async function main(): Promise<void> {
  const workspaceArg = process.argv[2] ?? ".";

  let model;
  try {
    model = loadModel();
  } catch (err) {
    printError(err instanceof Error ? err.message : String(err));
    process.exitCode = 1;
    return;
  }

  let workspace: Workspace;
  try {
    workspace = await Workspace.create(workspaceArg);
  } catch (err) {
    printError(err instanceof Error ? err.message : String(err));
    process.exitCode = 1;
    return;
  }

  const proposalHolder: { current: SaveReadmeProposal | null } = { current: null };
  const tools = buildTools(workspace, (proposal) => {
    proposalHolder.current = proposal;
  });

  printSystem(`README Assistant — workspace: ${workspace.root}`);
  printSystem('Type a message, or "exit" to quit.\n');

  const rl = createPromptInterface();
  let history: ModelMessage[] = [];

  try {
    while (true) {
      const input = (await rl.question("you> ")).trim();
      if (!input) continue;
      if (/^(exit|quit)$/i.test(input)) break;

      proposalHolder.current = null;
      printAssistantPrefix();

      try {
        history = await runAgentTurn(model, tools, history, input, {
          onTextDelta: printTextDelta,
          onToolCall: (e) => printToolCall(e.toolName, e.input),
          onToolResult: (e) => printToolResult(e.toolName, e.output),
        });
      } catch (err) {
        printNewline();
        printError(err instanceof Error ? err.message : String(err));
        continue;
      }

      printNewline();

      const proposal = readProposal(proposalHolder);
      if (proposal) {
        const ok = await confirm(`Save proposed README to "${proposal.path}"?`);
        if (ok) {
          const abs = workspace.resolve(proposal.path);
          await fs.writeFile(abs, proposal.content, "utf8");
          printSystem(`Saved ${proposal.path}`);
        } else {
          printSystem("Discarded the proposal.");
        }
      }
    }
  } finally {
    rl.close();
  }
}

main().catch((err) => {
  printError(err instanceof Error ? err.stack ?? err.message : String(err));
  process.exitCode = 1;
});
