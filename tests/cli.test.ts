import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { createInterface, type Interface } from "node:readline/promises";
import { Readable, Writable } from "node:stream";
import { convertArrayToReadableStream, MockLanguageModelV4 } from "ai/test";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const loadModelMock = vi.fn();
vi.mock("../src/config.js", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../src/config.js")>();
  return {
    ...actual,
    loadModel: loadModelMock,
  };
});

let terminal: { input: Readable; rl: Interface };

vi.mock("../src/ui.js", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../src/ui.js")>();
  return {
    ...actual,
    createPromptInterface: () => terminal.rl,
  };
});

function fakeTerminal(): { input: Readable; rl: Interface } {
  const input = new Readable({ read() {} });
  const output = new Writable({
    write(_chunk, _enc, cb) {
      cb();
    },
  });
  const rl = createInterface({ input, output });
  return { input, rl };
}

function usage() {
  return {
    inputTokens: {
      total: 1,
      noCache: 1,
      cacheRead: undefined,
      cacheWrite: undefined,
    },
    outputTokens: { total: 1, text: 1, reasoning: undefined },
  };
}

function textOnlyModel(text: string) {
  return new MockLanguageModelV4({
    doStream: async () => ({
      stream: convertArrayToReadableStream([
        { type: "stream-start" as const, warnings: [] },
        { type: "text-start" as const, id: "t1" },
        { type: "text-delta" as const, id: "t1", delta: text },
        { type: "text-end" as const, id: "t1" },
        { type: "finish" as const, finishReason: "stop" as const, usage: usage() },
      ]),
    }),
  });
}

function saveReadmeModel(content: string) {
  return new MockLanguageModelV4({
    doStream: [
      {
        stream: convertArrayToReadableStream([
          { type: "stream-start" as const, warnings: [] },
          {
            type: "tool-call" as const,
            toolCallId: "call_1",
            toolName: "saveReadme",
            input: JSON.stringify({ path: "README.md", content }),
          },
          {
            type: "finish" as const,
            finishReason: "tool-calls" as const,
            usage: usage(),
          },
        ]),
      },
      {
        stream: convertArrayToReadableStream([
          { type: "stream-start" as const, warnings: [] },
          { type: "text-start" as const, id: "t1" },
          { type: "text-delta" as const, id: "t1", delta: "Drafted a README." },
          { type: "text-end" as const, id: "t1" },
          { type: "finish" as const, finishReason: "stop" as const, usage: usage() },
        ]),
      },
    ],
  });
}

describe("cli main()", () => {
  let root: string;
  let originalArgv: string[];
  // biome-ignore lint/suspicious/noExplicitAny: spy type varies by which stream method is mocked
  let stdoutSpy: any;
  // biome-ignore lint/suspicious/noExplicitAny: spy type varies by which stream method is mocked
  let stderrSpy: any;

  beforeEach(async () => {
    root = await mkdtemp(path.join(tmpdir(), "readme-assistant-cli-"));
    terminal = fakeTerminal();
    originalArgv = process.argv;
    stdoutSpy = vi
      .spyOn(process.stdout, "write")
      .mockImplementation(() => true);
    stderrSpy = vi
      .spyOn(process.stderr, "write")
      .mockImplementation(() => true);
    loadModelMock.mockReset();
    process.exitCode = 0;
  });

  afterEach(async () => {
    process.argv = originalArgv;
    stdoutSpy.mockRestore();
    stderrSpy.mockRestore();
    try {
      terminal.rl.close();
    } catch {
      // already closed by main()
    }
    await rm(root, { recursive: true, force: true });
    process.exitCode = 0;
    vi.resetModules();
  });

  it("exits with code 1 and prints an error when the model fails to load", async () => {
    loadModelMock.mockRejectedValue(new Error("OPENAI_API_KEY is not set."));
    const { main } = await import("../src/cli.js");

    process.argv = ["node", "cli.js", root];
    await main();

    expect(process.exitCode).toBe(1);
  });

  it("exits with code 1 when the workspace path is not a directory", async () => {
    loadModelMock.mockResolvedValue(textOnlyModel("ok"));
    const { main } = await import("../src/cli.js");

    const notADir = path.join(root, "file.txt");
    await writeFile(notADir, "x");

    process.argv = ["node", "cli.js", notADir];
    await main();

    expect(process.exitCode).toBe(1);
  });

  it("runs a turn, stages a README proposal, and saves it after confirming", async () => {
    loadModelMock.mockResolvedValue(saveReadmeModel("# Fixture\n\nHello."));
    const { main } = await import("../src/cli.js");

    terminal.input.push("please write a readme\n");
    terminal.input.push("n\n"); // skip the diff
    terminal.input.push("y\n"); // accept the proposal
    terminal.input.push("exit\n");

    process.argv = ["node", "cli.js", root];
    await main();

    const saved = await readFile(path.join(root, "README.md"), "utf8");
    expect(saved).toBe("# Fixture\n\nHello.");
    expect(process.exitCode).toBe(0);
  });

  it("discards a staged proposal when the user declines to accept it", async () => {
    loadModelMock.mockResolvedValue(saveReadmeModel("# Should not be saved"));
    const { main } = await import("../src/cli.js");

    terminal.input.push("please write a readme\n");
    terminal.input.push("n\n"); // skip the diff
    terminal.input.push("n\n"); // decline
    terminal.input.push("exit\n");

    process.argv = ["node", "cli.js", root];
    await main();

    await expect(
      readFile(path.join(root, "README.md"), "utf8"),
    ).rejects.toThrow();
  });

  it("switches doc modes via /mode and rejects an unknown mode id", async () => {
    loadModelMock.mockResolvedValue(textOnlyModel("ok"));
    const chunks: string[] = [];
    stdoutSpy.mockImplementation((chunk: unknown) => {
      chunks.push(String(chunk));
      return true;
    });

    const { main } = await import("../src/cli.js");

    terminal.input.push("/mode api-docs\n");
    terminal.input.push("/mode bogus-mode\n");
    terminal.input.push("exit\n");

    process.argv = ["node", "cli.js", root];
    await main();

    const output = chunks.join("");
    expect(output).toContain("Switched to mode: API docs");
    expect(output).toContain('Unknown mode "bogus-mode"');
  });

  it("continues the loop on empty input instead of treating it as a message", async () => {
    const model = textOnlyModel("ok");
    loadModelMock.mockResolvedValue(model);
    const { main } = await import("../src/cli.js");

    terminal.input.push("\n");
    terminal.input.push("   \n");
    terminal.input.push("exit\n");

    process.argv = ["node", "cli.js", root];
    await main();

    expect(model.doStreamCalls).toHaveLength(0);
    expect(process.exitCode).toBe(0);
  });
});
