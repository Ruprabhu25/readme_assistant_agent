import { streamText, stepCountIs, type LanguageModel, type ModelMessage, type ToolSet } from "ai";

const SYSTEM_PROMPT = `You are a README Assistant. You help a user understand a local project workspace and draft or improve its documentation.

You have tools to list files, read files, search file contents, inspect package.json, find an existing README, and summarize large files. Use them to gather real context before answering — never invent file contents or project details.

When asked to generate or improve a README:
1. Check for an existing README first.
2. Inspect package.json and list key files to understand the project.
3. Read the files you need for accurate context.
4. Produce a clear, well-structured README in Markdown.
5. Use the saveReadme tool to propose the content — this only stages a proposal, it does not write to disk. Tell the user you've staged a draft and they should confirm before it's saved.

Be concise in your prose responses; let the README content itself be the detailed artifact.`;

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
  callbacks: AgentTurnCallbacks = {},
): Promise<ModelMessage[]> {
  const messages: ModelMessage[] = [...history, { role: "user", content: userInput }];

  const result = streamText({
    model,
    system: SYSTEM_PROMPT,
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
        callbacks.onToolResult?.({ toolName: part.toolName, output: part.output });
        break;
      default:
        break;
    }
  }

  const responseMessages = await result.responseMessages;
  return [...messages, ...responseMessages];
}
