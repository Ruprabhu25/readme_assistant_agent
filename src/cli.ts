#!/usr/bin/env node
import { promises as fs } from "node:fs";
import type { LanguageModel, ModelMessage } from "ai";
import { runAgentTurn } from "./agent.js";
import { loadModel } from "./config.js";
import { createDebugLogger, parseDebugFlag, stripDebugFlag } from "./debug.js";
import { renderDiff } from "./diff.js";
import {
  DEFAULT_DOC_MODE,
  describeModes,
  DOC_MODES,
  isDocModeId,
  parseModeFlag,
  stripModeFlag,
} from "./docModes.js";
import {
  loadHistory,
  parseHistoryFlag,
  saveHistory,
  stripHistoryFlag,
} from "./history.js";
import { buildTools, type SaveReadmeProposal } from "./tools/index.js";
import {
  askYesNo,
  createPromptInterface,
  printAssistantPrefix,
  printError,
  printNewline,
  printSystem,
  printTextDelta,
  printToolCall,
  printToolResult,
  startThinkingIndicator,
} from "./ui.js";
import { Workspace } from "./workspace.js";

function readProposal(holder: {
  current: SaveReadmeProposal | null;
}): SaveReadmeProposal | null {
  return holder.current;
}

async function main(): Promise<void> {
  const rawArgs = process.argv.slice(2);
  const debugLogPath = parseDebugFlag(rawArgs);
  const historyPath = parseHistoryFlag(rawArgs);
  let mode = parseModeFlag(rawArgs) ?? DEFAULT_DOC_MODE;
  const positionalArgs = stripModeFlag(
    stripHistoryFlag(stripDebugFlag(rawArgs)),
  );
  const workspaceArg = positionalArgs[0] ?? ".";
  const debug = createDebugLogger(debugLogPath);

  let model: LanguageModel;
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

  const proposalHolder: { current: SaveReadmeProposal | null } = {
    current: null,
  };
  const tools = buildTools(workspace, (proposal) => {
    proposalHolder.current = proposal;
  });

  printSystem(`Documentation Assistant — workspace: ${workspace.root}`);
  printSystem(`Mode: ${DOC_MODES[mode].label} (use /mode to switch)`);
  if (debugLogPath)
    printSystem(`Debug logging enabled — writing to ${debugLogPath}`);
  if (historyPath)
    printSystem(`Chat history enabled — persisting to ${historyPath}`);
  printSystem('Type a message, or "exit" to quit.\n');

  const rl = createPromptInterface();
  let history: ModelMessage[] = historyPath
    ? await loadHistory(historyPath)
    : [];

  try {
    debug.log("chat-start", "");
    while (true) {
      const input = (await rl.question("you> ")).trim();
      if (!input) continue;
      if (/^(exit|quit)$/i.test(input)) break;

      if (/^\/mode\b/i.test(input)) {
        const requested = input.slice("/mode".length).trim();
        if (!requested) {
          printSystem(`Available modes:\n${describeModes(mode)}`);
        } else if (isDocModeId(requested)) {
          mode = requested;
          printSystem(`Switched to mode: ${DOC_MODES[mode].label}`);
        } else {
          printError(
            `Unknown mode "${requested}". Available modes:\n${describeModes(mode)}`,
          );
        }
        continue;
      }

      proposalHolder.current = null;
      debug.log("user-input", input);

      const stopThinking = startThinkingIndicator();
      let prefixPrinted = false;
      const ensurePrefix = () => {
        if (prefixPrinted) return;
        prefixPrinted = true;
        stopThinking();
        printAssistantPrefix();
      };

      try {
        history = await runAgentTurn(model, tools, history, input, mode, {
          onTextDelta: (delta) => {
            ensurePrefix();
            printTextDelta(delta);
          },
          onToolCall: (e) => {
            ensurePrefix();
            printToolCall(e.toolName, e.input);
            debug.log("tool-call", e);
          },
          onToolResult: (e) => {
            printToolResult(e.toolName, e.output);
            debug.log("tool-result", e);
          },
        });
      } catch (err) {
        stopThinking();
        printNewline();
        const message = err instanceof Error ? err.message : String(err);
        printError(message);
        debug.log("error", message);
        continue;
      }
      stopThinking();
      ensurePrefix();

      if (historyPath) await saveHistory(historyPath, history);

      printNewline();

      const proposal = readProposal(proposalHolder);
      if (proposal) {
        const abs = workspace.resolve(proposal.path);
        const existing = await fs.readFile(abs, "utf8").catch(() => "");

        const wantsDiff = await askYesNo(
          rl,
          `Show a diff of the proposed changes to "${proposal.path}"?`,
        );
        if (wantsDiff) {
          printSystem(renderDiff(existing, proposal.content));
        }

        const accept = await askYesNo(
          rl,
          `Accept these changes and save to "${proposal.path}"?`,
        );
        if (accept) {
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
  printError(err instanceof Error ? (err.stack ?? err.message) : String(err));
  process.exitCode = 1;
});
