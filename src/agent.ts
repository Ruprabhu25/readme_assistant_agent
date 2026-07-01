import {
  type LanguageModel,
  type ModelMessage,
  stepCountIs,
  streamText,
  type ToolSet,
} from "ai";
import { DOC_MODES, type DocModeId } from "./docModes.js";

function buildSystemPrompt(mode: DocModeId): string {
  return `You are a Documentation Assistant. You help a user understand a local project workspace and draft or improve its documentation.

You have tools to list files, read files, search file contents, inspect package.json, find an existing README, and summarize large files. Use them to gather real context before answering — never invent file contents or project details.

${DOC_MODES[mode].focus}

General rules that apply regardless of mode:
- When the user asks about a specific named file (e.g. "what does src/foo.ts do", "cover the details of config/setup.ts"), call summarizeFile on it first to see its size and a preview. Only follow up with a full readFile if the summary is insufficient for what the user is asking about — don't default straight to readFile for a file the user has singled out.
- For any directory structure section, paste the \`tree\` field from listFiles verbatim inside a code block — never hand-draw or re-derive the tree from the \`files\` list yourself, since manual ASCII art can silently drop entries.
- For any file you reference (LICENSE, CHANGELOG, docs/, etc.) that isn't already covered by the mode instructions above, confirm it exists via a tool call first, or omit the mention; never write placeholder text like "if available" or "see LICENSE file for details" pointing at a file you haven't confirmed exists.
- Use the saveReadme tool to propose the content — this only stages a proposal, it does not write to disk. Tell the user you've staged a draft and they should confirm before it's saved.

Be concise in your prose responses; let the document content itself be the detailed artifact.`;
}

export interface ToolCallEvent {
  toolName: string;
  input: unknown;
}

export interface ToolResultEvent {
  toolName: string;
  output: unknown;
}

export interface AgentTurnCallbacks {
  onTextDelta?: (delta: string) => void;
  onToolCall?: (event: ToolCallEvent) => void;
  onToolResult?: (event: ToolResultEvent) => void;
}

export async function runAgentTurn(
  model: LanguageModel,
  tools: ToolSet,
  history: ModelMessage[],
  userInput: string,
  mode: DocModeId,
  callbacks: AgentTurnCallbacks = {},
): Promise<ModelMessage[]> {
  const messages: ModelMessage[] = [
    ...history,
    { role: "user", content: userInput },
  ];

  const result = streamText({
    model,
    system: buildSystemPrompt(mode),
    messages,
    tools,
    stopWhen: stepCountIs(8),
  });

  for await (const part of result.fullStream) {
    switch (part.type) {
      case "text-delta":
        callbacks.onTextDelta?.(part.text);
        break;
      case "tool-call":
        callbacks.onToolCall?.({ toolName: part.toolName, input: part.input });
        break;
      case "tool-result":
        callbacks.onToolResult?.({
          toolName: part.toolName,
          output: part.output,
        });
        break;
      default:
        break;
    }
  }

  const responseMessages = await result.responseMessages;
  return [...messages, ...responseMessages];
}
