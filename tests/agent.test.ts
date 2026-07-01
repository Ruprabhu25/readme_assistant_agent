import { tool } from "ai";
import { convertArrayToReadableStream, MockLanguageModelV4 } from "ai/test";
import { describe, expect, it } from "vitest";
import { z } from "zod";
import {
  runAgentTurn,
  type ToolCallEvent,
  type ToolResultEvent,
} from "../src/agent.js";

function usage() {
  return {
    inputTokens: {
      total: 10,
      noCache: 10,
      cacheRead: undefined,
      cacheWrite: undefined,
    },
    outputTokens: { total: 5, text: 5, reasoning: undefined },
  };
}

describe("runAgentTurn", () => {
  it("executes a tool call, then returns the model's final text", async () => {
    const model = new MockLanguageModelV4({
      doStream: [
        {
          stream: convertArrayToReadableStream([
            { type: "stream-start", warnings: [] },
            {
              type: "tool-call",
              toolCallId: "call_1",
              toolName: "echoFiles",
              input: JSON.stringify({ note: "hi" }),
            },
            { type: "finish", finishReason: "tool-calls", usage: usage() },
          ]),
        },
        {
          stream: convertArrayToReadableStream([
            { type: "stream-start", warnings: [] },
            { type: "text-start", id: "t1" },
            { type: "text-delta", id: "t1", delta: "Here is your README." },
            { type: "text-end", id: "t1" },
            { type: "finish", finishReason: "stop", usage: usage() },
          ]),
        },
      ],
    });

    const toolCalls: ToolCallEvent[] = [];
    const toolResults: ToolResultEvent[] = [];
    let text = "";

    const tools = {
      echoFiles: tool({
        description: "echoes the note back",
        inputSchema: z.object({ note: z.string() }),
        execute: async ({ note }: { note: string }) => ({ echoed: note }),
      }),
    };

    const history = await runAgentTurn(model, tools, [], "Generate a README", {
      onTextDelta: (delta) => {
        text += delta;
      },
      onToolCall: (e) => toolCalls.push(e),
      onToolResult: (e) => toolResults.push(e),
    });

    expect(toolCalls).toHaveLength(1);
    expect(toolCalls[0].toolName).toBe("echoFiles");
    expect(toolCalls[0].input).toEqual({ note: "hi" });

    expect(toolResults).toHaveLength(1);
    expect(toolResults[0].output).toEqual({ echoed: "hi" });

    expect(text).toBe("Here is your README.");

    // history: user message, assistant tool-call message, tool-result message, final assistant text message
    expect(history).toHaveLength(4);
    expect(history[0]).toEqual({ role: "user", content: "Generate a README" });
  });

  it("carries prior turn history into the next call's messages", async () => {
    const model = new MockLanguageModelV4({
      doStream: () => ({
        stream: convertArrayToReadableStream([
          { type: "stream-start", warnings: [] },
          { type: "text-start", id: "t1" },
          { type: "text-delta", id: "t1", delta: "ok" },
          { type: "text-end", id: "t1" },
          { type: "finish", finishReason: "stop", usage: usage() },
        ]),
      }),
    });

    const first = await runAgentTurn(model, {}, [], "hello");
    expect(first.map((m) => m.role)).toEqual(["user", "assistant"]);

    const second = await runAgentTurn(model, {}, first, "again");
    expect(second.map((m) => m.role)).toEqual([
      "user",
      "assistant",
      "user",
      "assistant",
    ]);
  });
});
